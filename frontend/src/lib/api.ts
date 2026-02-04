import axios, { AxiosError, AxiosProgressEvent } from 'axios';

// ==========================================
// LOAD BALANCER: Instant Selection + Background Wake-up
// TIER 1: 24/7 Always-Awake Servers (HF, Northflank) - INSTANT, no waiting
// TIER 2: Sleeping Servers (Render, Zeabur) - Wake in background, use when healthy
// ==========================================

// TIER 1: 24/7 Always-Awake Servers (kept alive by keep-alive bot)
// These are used IMMEDIATELY - no health check wait
const ALWAYS_AWAKE_SERVERS = [
    process.env.NEXT_PUBLIC_API_URL_4 || 'https://spandan1234-magetool-backend-api.hf.space', // HF 1 (Primary 24/7)
    'https://spandan1234-magetool-backend-1.hf.space',                                        // HF 2 (Primary 24/7)
    process.env.NEXT_PUBLIC_API_URL_3 || 'https://p01--magetool--c6b4tq5mg4jv.code.run',      // Northflank (Backup 24/7)
].filter(url => url && url !== 'undefined' && !url.includes('example.com')).map(url => url.replace(/\/$/, ''));

// DISTRIBUTED WORKERS: For parallel video processing (chunks)
// These are NEW HF Spaces specifically for distributed chunk processing
const DISTRIBUTED_WORKERS = [
    'https://spandan1234-magetool-backend-2.hf.space',
    'https://spandan1234-magetool-backend-3.hf.space',
    'https://spandan1234-magetool-backend-4.hf.space',
];
const DISTRIBUTED_WORKER_HEALTH: Record<string, boolean> = {};
DISTRIBUTED_WORKERS.forEach(url => { DISTRIBUTED_WORKER_HEALTH[url] = false; }); // Assume unknown until checked

// TIER 2: Sleeping Servers (may need cold start - 30-60 seconds)
// These are woken up in background, used once healthy
const SLEEPING_SERVERS = [
    process.env.NEXT_PUBLIC_API_URL || 'https://magetool-api.onrender.com',     // Render (750 hrs/month)
    process.env.NEXT_PUBLIC_API_URL_2 || 'https://magetool.zeabur.app',         // Zeabur ($5/month credit)
].filter(url => url && url !== 'undefined' && !url.includes('example.com')).map(url => url.replace(/\/$/, ''));

// Combined list for compatibility
const API_SERVERS = [...ALWAYS_AWAKE_SERVERS, ...SLEEPING_SERVERS];

// Load balancer state
let awakeServerIndex = 0;  // For round-robin within awake servers
let sleepingServerIndex = 0;  // For round-robin within sleeping servers
const SERVER_HEALTH: Record<string, boolean> = {};
const HEALTH_CHECK_TIMEOUT = 60000; // 60 seconds timeout for health check
let lastUsedServerUrl: string = ALWAYS_AWAKE_SERVERS[0]; // Default to instant server

// Initialize health state: Assume 24/7 servers are HEALTHY, sleeping servers are UNKNOWN
ALWAYS_AWAKE_SERVERS.forEach(server => { SERVER_HEALTH[server] = true; });
SLEEPING_SERVERS.forEach(server => { SERVER_HEALTH[server] = false; }); // Assume asleep until proven otherwise

/**
 * Get a friendly name for a server URL
 */
export function getServerName(url: string): string {
    if (!url) return 'Unknown';
    if (url.includes('onrender.com')) return 'Render';
    if (url.includes('code.run')) return 'Northflank';
    if (url.includes('zeabur.app')) return 'Zeabur';
    if (url.includes('hf.space')) return 'Hugging Face';
    if (url.includes('localhost')) return 'Localhost';
    return 'Cloud';
}

/**
 * Get the name of the last successfully used server
 */
export function getLastUsedServerName(): string {
    return getServerName(lastUsedServerUrl);
}

// Active Health Check System (non-blocking)
async function checkServerHealth(url: string): Promise<boolean> {
    try {
        // Try /health/live first
        await axios.get(`${url}/health/live`, { timeout: HEALTH_CHECK_TIMEOUT });
        console.log(`[LoadBalancer] ✅ Server Healthy: ${getServerName(url)}`);
        SERVER_HEALTH[url] = true;
        return true;
    } catch (error) {
        // Fallback: Try root / endpoint (some proxies block /health/live)
        try {
            await axios.get(`${url}/`, { timeout: HEALTH_CHECK_TIMEOUT });
            console.log(`[LoadBalancer] ✅ Server Healthy (via /): ${getServerName(url)}`);
            SERVER_HEALTH[url] = true;
            return true;
        } catch {
            console.warn(`[LoadBalancer] ❌ Server Unhealthy: ${getServerName(url)}`);
            SERVER_HEALTH[url] = false;
            return false;
        }
    }
}

/**
 * Wake up ONLY sleeping servers (Render, Zeabur) in background
 * 24/7 servers (HF, Northflank) don't need wake-up
 * This is NON-BLOCKING - fire and forget
 */
export const wakeUpSleepingServers = async () => {
    console.log('[LoadBalancer] 🌅 Waking up sleeping servers in background...');

    // Only wake sleeping servers - no need to ping 24/7 servers
    const checks = SLEEPING_SERVERS.map(server => checkServerHealth(server));

    // Fire and forget - don't await, let it run in background
    Promise.allSettled(checks).then(() => {
        console.log('[LoadBalancer] 🌅 Background wake-up complete:',
            SLEEPING_SERVERS.map(s => `${getServerName(s)}: ${SERVER_HEALTH[s] ? 'AWAKE ✅' : 'SLEEPING 💤'}`).join(', ')
        );
    });
};

// Legacy alias for compatibility
export const wakeUpServers = wakeUpSleepingServers;

// Initial Wake-up: Start waking sleeping servers immediately (non-blocking)
wakeUpSleepingServers();

/**
 * Get an INSTANT server from 24/7 pool
 * No health check - assumes they're awake (kept alive by bot)
 */
function getInstantServer(): string {
    const server = ALWAYS_AWAKE_SERVERS[awakeServerIndex % ALWAYS_AWAKE_SERVERS.length];
    awakeServerIndex = (awakeServerIndex + 1) % ALWAYS_AWAKE_SERVERS.length;
    return server;
}

/**
 * Get the next healthy server using ROUND-ROBIN routing
 * 
 * STRATEGY:
 * 1. PRIMARY (HF + Northflank): True round-robin alternation
 *    - Task 1 → HF, Task 2 → NF, Task 3 → HF, Task 4 → NF...
 *    - If one is down, use the other
 *    - Both down → fallback to backup
 * 
 * 2. BACKUP (Render + Zeabur): Only when BOTH primary servers fail
 * 
 * @param category - Optional tool category (e.g. 'video', 'image')
 */
function getNextServer(category?: string): string {
    // ==========================================
    // PRIMARY: Round-robin between HF and Northflank
    // Alternates: HF → NF → HF → NF...
    // ==========================================
    const healthyAwakeServers = ALWAYS_AWAKE_SERVERS.filter(s => SERVER_HEALTH[s]);

    if (healthyAwakeServers.length > 0) {
        // Get the next server in round-robin order from ALL awake servers
        // But only use it if it's healthy
        let attempts = 0;
        while (attempts < ALWAYS_AWAKE_SERVERS.length) {
            const candidateServer = ALWAYS_AWAKE_SERVERS[awakeServerIndex % ALWAYS_AWAKE_SERVERS.length];
            awakeServerIndex = (awakeServerIndex + 1) % ALWAYS_AWAKE_SERVERS.length;

            if (SERVER_HEALTH[candidateServer]) {
                console.log(`[LoadBalancer] 🚀 PRIMARY (Round-Robin): Using ${getServerName(candidateServer)} for ${category || 'general'} task`);
                lastUsedServerUrl = candidateServer;
                return candidateServer;
            }
            attempts++;
        }
    }

    // ==========================================
    // BACKUP: Both HF and Northflank unavailable
    // Use Render/Zeabur with round-robin
    // ==========================================
    const healthySleepingServers = SLEEPING_SERVERS.filter(s => SERVER_HEALTH[s]);

    if (healthySleepingServers.length > 0) {
        const server = healthySleepingServers[sleepingServerIndex % healthySleepingServers.length];
        sleepingServerIndex = (sleepingServerIndex + 1) % healthySleepingServers.length;
        console.warn(`[LoadBalancer] 🔄 BACKUP: HF & Northflank down! Using ${getServerName(server)}`);
        lastUsedServerUrl = server;
        return server;
    }

    // ==========================================
    // LAST RESORT: All servers seem down
    // Try 24/7 server anyway (most likely to recover)
    // ==========================================
    console.warn('[LoadBalancer] ⚠️ All servers marked unhealthy! Trying 24/7 server anyway...');
    const server = getInstantServer();
    lastUsedServerUrl = server;

    // Trigger background recovery for all servers
    [...ALWAYS_AWAKE_SERVERS, ...SLEEPING_SERVERS].forEach(s => checkServerHealth(s));

    return server;
}

/**
 * Mark a server as unhealthy (will be skipped in rotation)
 */
function markServerUnhealthy(serverUrl: string): void {
    if (SERVER_HEALTH[serverUrl]) {
        SERVER_HEALTH[serverUrl] = false;
        console.warn(`[LoadBalancer] Server marked unhealthy: ${serverUrl}. Removing from rotation.`);

        // Try to recover it after 60 seconds
        setTimeout(() => {
            console.log(`[LoadBalancer] Attempting to recover server: ${serverUrl}`);
            checkServerHealth(serverUrl);
        }, 60000);
    }
}

/**
 * Get current server for this request
 */
export function getCurrentApiServer(): string {
    return getNextServer();
}

// Task-to-Server mapping (ensures task stays on same server for status/download)
const TASK_SERVER_MAP: Record<string, string> = {};

/**
 * Store which server a task was created on
 */
export function setServerForTask(taskId: string, serverUrl: string): void {
    TASK_SERVER_MAP[taskId] = serverUrl;
}

/**
 * Get server for a specific task (returns stored server, or default)
 */
function getServerForTask(taskId: string): string {
    return TASK_SERVER_MAP[taskId] || API_SERVERS[0];
}

// Default API base (for backward compatibility)
const API_BASE_URL = API_SERVERS[0];

// Create axios instance with defaults
const api = axios.create({
    baseURL: API_BASE_URL,
    timeout: 300000, // 5 minutes for large file uploads
    headers: {
        'Content-Type': 'application/json',
    },
});

// ==========================================
// SECURITY: FILE VALIDATION
// ==========================================
const FILE_SIZE_LIMITS: Record<string, number> = {
    image: 50 * 1024 * 1024,      // 50 MB
    video: 500 * 1024 * 1024,     // 500 MB
    audio: 100 * 1024 * 1024,     // 100 MB
    document: 50 * 1024 * 1024,   // 50 MB
};

const ALLOWED_EXTENSIONS: Record<string, Set<string>> = {
    image: new Set(['jpg', 'jpeg', 'png', 'webp', 'gif', 'bmp', 'tiff', 'tif', 'ico', 'svg', 'heic', 'heif']),
    video: new Set(['mp4', 'mkv', 'avi', 'mov', 'webm', 'flv', 'wmv', 'm4v']),
    audio: new Set(['mp3', 'wav', 'aac', 'flac', 'ogg', 'm4a', 'wma', 'opus']),
    document: new Set(['pdf', 'docx', 'doc', 'txt', 'rtf', 'odt', 'md', 'json', 'csv', 'xml', 'xlsx', 'xls', 'html']),
};

export interface FileValidationResult {
    valid: boolean;
    error?: string;
}

/**
 * Validate file before upload (client-side security check)
 */
export const validateFile = (file: File, category: string): FileValidationResult => {
    // Check file exists
    if (!file || !file.name) {
        return { valid: false, error: 'No file provided' };
    }

    // Get extension
    const extension = file.name.split('.').pop()?.toLowerCase() || '';

    // Validate extension
    const allowedExtensions = ALLOWED_EXTENSIONS[category];
    if (allowedExtensions && !allowedExtensions.has(extension)) {
        return {
            valid: false,
            error: `Invalid file type. Allowed: ${Array.from(allowedExtensions).join(', ')}`
        };
    }

    // Validate size
    const sizeLimit = FILE_SIZE_LIMITS[category] || FILE_SIZE_LIMITS.document;
    if (file.size > sizeLimit) {
        const limitMB = sizeLimit / (1024 * 1024);
        const fileMB = (file.size / (1024 * 1024)).toFixed(1);
        return {
            valid: false,
            error: `File too large (${fileMB} MB). Maximum: ${limitMB} MB`
        };
    }

    // Check for empty file
    if (file.size === 0) {
        return { valid: false, error: 'File is empty' };
    }

    return { valid: true };
};

/**
 * Sanitize filename
 */
const sanitizeFilename = (filename: string): string => {
    return filename
        .replace(/[/\\]/g, '_')         // Remove path separators
        .replace(/\x00/g, '')            // Remove null bytes
        .replace(/\.\./g, '.')           // Prevent directory traversal
        .trim();
};

// ==========================================
// TYPES
// ==========================================
export interface TaskResponse {
    task_id: string;
    status: 'queued' | 'uploaded' | 'processing' | 'complete' | 'failed' | 'cancelled';
    original_filename?: string;
    output_filename?: string;
    progress_percent?: number;
    estimated_time_remaining_seconds?: number;
    error_message?: string;
    download_url?: string;
    file_size?: number;
}

export interface UploadResponse {
    task_id: string;
    message: string;
}

export interface HealthResponse {
    status: string;
    checks?: Record<string, boolean>;
}

export interface ErrorResponse {
    error: string;
    details?: string;
    status_code: number;
    timestamp: string;
    request_id?: string;
    suggested_action?: string;
}

// ==========================================
// HELPER FUNCTIONS
// ==========================================
const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

/**
 * Parse error response with user-friendly messages
 */
const parseErrorResponse = (error: AxiosError): string => {
    if (error.response?.status === 429) {
        return 'Too many requests. Please wait a moment and try again.';
    }
    if (error.response?.status === 413) {
        return 'File is too large. Please use a smaller file.';
    }
    if (error.response?.data) {
        const data = error.response.data as ErrorResponse;
        return data.error || data.details || 'An error occurred';
    }
    if (error.code === 'ECONNABORTED') {
        return 'Request timed out. Please try again.';
    }
    return error.message || 'An unexpected error occurred';
};

// ==========================================
// API FUNCTIONS
// ==========================================

// Health Check
export const checkHealth = async (): Promise<HealthResponse> => {
    const response = await api.get('/health/live');
    return response.data;
};

// Generic file upload function with validation and load balancing
// Generic file upload function with validation and load balancing + AUTO RETRY
export const uploadFile = async (
    endpoint: string,
    file: File,
    options: Record<string, any> = {},
    onUploadProgress?: (progressEvent: AxiosProgressEvent) => void,
    category?: string
): Promise<UploadResponse> => {
    // Client-side validation (if category provided)
    if (category) {
        const validation = validateFile(file, category);
        if (!validation.valid) {
            throw new Error(validation.error);
        }
    }

    const formData = new FormData();
    formData.append('file', file);

    // Add options as form data
    Object.entries(options).forEach(([key, value]) => {
        formData.append(key, String(value));
    });

    // RETRY LOGIC - Try up to 3 times for reliability
    let lastError: any;
    for (let attempt = 0; attempt < 3; attempt++) {
        const serverUrl = getNextServer(category);
        console.log(`[LoadBalancer] Attempt ${attempt + 1}: Using server ${serverUrl}`);

        try {
            const response = await axios.post(`${serverUrl}${endpoint}`, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
                timeout: 600000,  // 10 minutes for large uploads
                onUploadProgress,
            });

            // Store server affinity for this task
            if (response.data.task_id) {
                setServerForTask(response.data.task_id, serverUrl);
            }

            return response.data;
        } catch (error) {
            lastError = error;
            console.warn(`[LoadBalancer] Attempt ${attempt + 1} failed on ${serverUrl}`);

            if (error instanceof AxiosError) {
                // Determine if we should retry
                // Added 404 - if endpoint missing on one server, try another
                const shouldRetry =
                    error.response?.status === 404 || // Endpoint not found - try another server
                    (error.response?.status && error.response.status >= 500) || // Server error
                    error.code === 'ERR_NETWORK' ||
                    error.code === 'ECONNABORTED'; // Connection error

                if (shouldRetry) {
                    // Only mark unhealthy for 500+ or network errors, NOT for 404
                    // 404 means endpoint missing, but server might be fine for other endpoints
                    if (error.response?.status !== 404) {
                        markServerUnhealthy(serverUrl);
                    }
                    if (attempt < 2) {
                        console.log(`[LoadBalancer] Retrying on next healthy server...`);
                        continue; // Retry loop
                    }
                }
            }
            break; // Don't retry client errors (400, 401 etc)
        }
    }

    // If we're here, all attempts failed
    if (lastError instanceof AxiosError) {
        throw new Error(parseErrorResponse(lastError));
    }
    throw lastError;
};

// Multiple files upload with validation
// Multiple files upload with validation + AUTO RETRY
export const uploadFiles = async (
    endpoint: string,
    files: File[],
    options: Record<string, any> = {},
    onUploadProgress?: (progressEvent: AxiosProgressEvent) => void,
    category?: string
): Promise<UploadResponse> => {
    // Validate all files
    if (category) {
        for (const file of files) {
            const validation = validateFile(file, category);
            if (!validation.valid) {
                throw new Error(`${file.name}: ${validation.error}`);
            }
        }
    }

    const formData = new FormData();

    files.forEach((file) => {
        formData.append('files', file);
    });

    // Add options as form data
    Object.entries(options).forEach(([key, value]) => {
        formData.append(key, String(value));
    });

    // RETRY LOGIC - Try up to 3 times for reliability
    let lastError: any;
    for (let attempt = 0; attempt < 3; attempt++) {
        const serverUrl = getNextServer(category);
        console.log(`[LoadBalancer] Attempt ${attempt + 1}: Using server ${serverUrl}`);

        try {
            const response = await axios.post(`${serverUrl}${endpoint}`, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
                timeout: 600000,  // 10 minutes for large uploads
                onUploadProgress,
            });

            // Store server affinity for this task
            if (response.data.task_id) {
                setServerForTask(response.data.task_id, serverUrl);
            }

            return response.data;
        } catch (error) {
            lastError = error;
            console.warn(`[LoadBalancer] Attempt ${attempt + 1} failed on ${serverUrl}`);

            if (error instanceof AxiosError) {
                // Added 404 - if endpoint missing on one server, try another
                const shouldRetry =
                    error.response?.status === 404 || // Endpoint not found - try another server
                    (error.response?.status && error.response.status >= 500) ||
                    error.code === 'ERR_NETWORK' ||
                    error.code === 'ECONNABORTED';

                if (shouldRetry) {
                    // Only mark unhealthy for 500+ or network errors, NOT for 404
                    if (error.response?.status !== 404) {
                        markServerUnhealthy(serverUrl);
                    }
                    if (attempt < 2) {
                        console.log(`[LoadBalancer] Retrying on next healthy server...`);
                        continue;
                    }
                }
            }
            break;
        }
    }

    if (lastError instanceof AxiosError) {
        throw new Error(parseErrorResponse(lastError));
    }
    throw lastError;
};

// Check task status (uses server affinity)
export const getTaskStatus = async (taskId: string): Promise<TaskResponse> => {
    const serverUrl = getServerForTask(taskId);
    const response = await axios.get(`${serverUrl}/api/status/${taskId}`, { timeout: 120000 });  // 2 min timeout
    return response.data;
};

// Start processing for an uploaded task (uses server affinity)
export const startProcessing = async (taskId: string): Promise<{ task_id: string; status: string; message: string }> => {
    const serverUrl = getServerForTask(taskId);
    try {
        const response = await axios.post(`${serverUrl}/api/start/${taskId}`, {}, { timeout: 120000 });  // 2 min timeout
        return response.data;
    } catch (error) {
        if (error instanceof AxiosError) {
            throw new Error(parseErrorResponse(error));
        }
        throw error;
    }
};

// Poll for task completion
export const pollTaskStatus = async (
    taskId: string,
    onProgress?: (task: TaskResponse) => void,
    intervalMs = 2000,
    maxAttempts = 300 // 10 minutes max polling for large video processing
): Promise<TaskResponse> => {
    return new Promise((resolve, reject) => {
        let attempts = 0;

        const poll = async () => {
            try {
                attempts++;
                const status = await getTaskStatus(taskId);

                if (onProgress) {
                    onProgress(status);
                }

                if (status.status === 'complete') {
                    resolve(status);
                    return;
                }

                if (status.status === 'failed' || status.status === 'cancelled') {
                    reject(new Error(status.error_message || 'Task failed'));
                    return;
                }

                if (attempts >= maxAttempts) {
                    reject(new Error('Task polling timeout'));
                    return;
                }

                // Continue polling
                setTimeout(poll, intervalMs);
            } catch (error) {
                reject(error);
            }
        };

        poll();
    });
};

// Track which tasks are using distributed processing
const DISTRIBUTED_TASK_MAP: Record<string, {
    file: File;
    endpoint: string;
    options: Record<string, any>;
    onProgress?: (e: AxiosProgressEvent) => void;
}> = {};

/**
 * Mark a task as using distributed processing (for fallback)
 */
export function markTaskAsDistributed(
    taskId: string,
    file: File,
    normalEndpoint: string,
    options: Record<string, any>,
    onProgress?: (e: AxiosProgressEvent) => void
): void {
    DISTRIBUTED_TASK_MAP[taskId] = { file, endpoint: normalEndpoint, options, onProgress };
}

/**
 * Poll for task completion with automatic fallback for distributed tasks
 * If a distributed task fails, automatically retry on normal servers
 */
export const pollTaskStatusWithFallback = async (
    taskId: string,
    onProgress?: (task: TaskResponse) => void,
    intervalMs = 2000,
    maxAttempts = 300
): Promise<TaskResponse> => {
    try {
        return await pollTaskStatus(taskId, onProgress, intervalMs, maxAttempts);
    } catch (error) {
        // Check if this was a distributed task that failed
        const distributedInfo = DISTRIBUTED_TASK_MAP[taskId];

        if (distributedInfo) {
            console.warn(`[Distributed] Task ${taskId} FAILED! Automatically retrying on normal servers...`);

            // Remove from distributed map
            delete DISTRIBUTED_TASK_MAP[taskId];

            try {
                // Retry with normal endpoint
                const retryResponse = await uploadFile(
                    distributedInfo.endpoint,
                    distributedInfo.file,
                    distributedInfo.options,
                    distributedInfo.onProgress,
                    'video'
                );

                console.log(`[Distributed] Retry successful! New task: ${retryResponse.task_id}`);

                // Start processing the new task
                await startProcessing(retryResponse.task_id);

                // Poll the new task
                return await pollTaskStatus(retryResponse.task_id, onProgress, intervalMs, maxAttempts);
            } catch (retryError) {
                console.error(`[Distributed] Retry also failed:`, retryError);
                throw retryError;
            }
        }

        // Not a distributed task, just throw the original error
        throw error;
    }
};


// Get download URL (uses server affinity)
export const getDownloadUrl = (taskId: string): string => {
    const serverUrl = getServerForTask(taskId);
    return `${serverUrl}/api/download/${taskId}`;
};

// ==========================================
// IMAGE API
// ==========================================
export const imageApi = {
    convert: (file: File, outputFormat: string, onProgress?: (e: AxiosProgressEvent) => void) =>
        uploadFile('/api/image/convert', file, { output_format: outputFormat }, onProgress, 'image'),

    crop: (file: File, x: number, y: number, width: number, height: number, onProgress?: (e: AxiosProgressEvent) => void) =>
        uploadFile('/api/image/crop', file, { x, y, width, height }, onProgress, 'image'),

    resize: (file: File, width: number, height: number, onProgress?: (e: AxiosProgressEvent) => void) =>
        uploadFile('/api/image/resize', file, { width, height }, onProgress, 'image'),

    removeBackground: (file: File, onProgress?: (e: AxiosProgressEvent) => void) =>
        uploadFile('/api/image/remove-background', file, {}, onProgress, 'image'),

    upscale: (file: File, scale: number, onProgress?: (e: AxiosProgressEvent) => void) =>
        uploadFile('/api/image/upscale', file, { scale }, onProgress, 'image'),

    watermarkAdd: (file: File, text: string, position: string, opacity: number, fontSize: number, onProgress?: (e: AxiosProgressEvent) => void) =>
        uploadFile('/api/image/watermark-add', file, { text, position, opacity, font_size: fontSize }, onProgress, 'image'),

    watermarkRemove: (file: File, detectionMode: string = 'auto', onProgress?: (e: AxiosProgressEvent) => void) =>
        uploadFile('/api/image/watermark-remove', file, { detection_mode: detectionMode }, onProgress, 'image'),

    exifScrub: (file: File, onProgress?: (e: AxiosProgressEvent) => void) =>
        uploadFile('/api/image/exif-scrub', file, {}, onProgress, 'image'),

    ocr: (file: File, outputFormat: string, onProgress?: (e: AxiosProgressEvent) => void) =>
        uploadFile('/api/image/ocr', file, { output_format: outputFormat }, onProgress, 'image'),

    meme: (file: File, topText: string, bottomText: string, fontSize: number, onProgress?: (e: AxiosProgressEvent) => void) =>
        uploadFile('/api/image/meme-generator', file, { top_text: topText, bottom_text: bottomText, font_size: fontSize }, onProgress, 'image'),

    negative: (file: File, effect: string, intensity: number, onProgress?: (e: AxiosProgressEvent) => void) =>
        uploadFile('/api/image/negative', file, { effect, intensity }, onProgress, 'image'),

    colorPalette: async (file: File, numColors: number = 5) => {
        const validation = validateFile(file, 'image');
        if (!validation.valid) throw new Error(validation.error);

        const formData = new FormData();
        formData.append('file', file);
        formData.append('num_colors', String(numColors));
        const response = await api.post('/api/image/color-palette', formData, {
            headers: { 'Content-Type': 'multipart/form-data' },
        });
        return response.data;
    },

    splitter: (file: File, rows: number, cols: number, onProgress?: (e: AxiosProgressEvent) => void) =>
        uploadFile('/api/image/splitter', file, { rows, cols }, onProgress, 'image'),

    favicon: (file: File, onProgress?: (e: AxiosProgressEvent) => void) =>
        uploadFile('/api/image/favicon', file, {}, onProgress, 'image'),

    blurFace: (file: File, blurIntensity: number, onProgress?: (e: AxiosProgressEvent) => void) =>
        uploadFile('/api/image/blur-face', file, { blur_intensity: blurIntensity }, onProgress, 'image'),

    passportPhoto: (file: File, country: string, backgroundColor: string, onProgress?: (e: AxiosProgressEvent) => void) =>
        uploadFile('/api/image/passport-photo', file, { country, background_color: backgroundColor }, onProgress, 'image'),

    collage: (files: File[], layout: string, spacing: number, onProgress?: (e: AxiosProgressEvent) => void) =>
        uploadFiles('/api/image/collage', files, { layout, spacing }, onProgress, 'image'),

    svgConvert: (file: File, smoothing: string, colorDepth: string, onProgress?: (e: AxiosProgressEvent) => void) =>
        uploadFile('/api/image/svg-convert', file, { smoothing, color_depth: colorDepth }, onProgress, 'image'),

    adjustSize: (file: File, targetSize: number, mode: string, onProgress?: (e: AxiosProgressEvent) => void) =>
        uploadFile('/api/image/adjust-size', file, { target_size: targetSize, mode }, onProgress, 'image'),

    imagesToPdf: (files: File[], pageSize: string, orientation: string, onProgress?: (e: AxiosProgressEvent) => void, quality: string = 'medium') =>
        uploadFiles('/api/pdf/create', files, { page_size: pageSize, orientation, quality }, onProgress, 'image'),
};

// ==========================================
// DISTRIBUTED VIDEO PROCESSING (with silent fallback)
// ==========================================

/**
 * Check if distributed workers are healthy
 * Fire-and-forget health check for workers
 */
async function checkDistributedWorkersHealth(): Promise<string[]> {
    const healthyWorkers: string[] = [];

    await Promise.allSettled(
        DISTRIBUTED_WORKERS.map(async (url) => {
            try {
                const response = await axios.get(`${url}/health`, { timeout: 5000 });
                if (response.status === 200) {
                    DISTRIBUTED_WORKER_HEALTH[url] = true;
                    healthyWorkers.push(url);
                }
            } catch {
                DISTRIBUTED_WORKER_HEALTH[url] = false;
            }
        })
    );

    return healthyWorkers;
}

/**
 * Try distributed processing first, silently fallback to normal if it fails
 * User never sees the error - completely transparent!
 */
async function uploadWithDistributedFallback(
    endpoint: string,
    distributedEndpoint: string,
    file: File,
    options: Record<string, any> = {},
    onProgress?: (e: AxiosProgressEvent) => void,
    category?: string
): Promise<UploadResponse> {
    // First, try distributed processing (for large files)
    // Skip distributed for small files < 10MB
    const TEN_MB = 10 * 1024 * 1024;

    if (file.size >= TEN_MB) {
        console.log(`[Distributed] File ${formatFileSize(file.size)} >= 10MB, trying distributed workers...`);

        try {
            // Check if any distributed workers are healthy
            const healthyWorkers = await checkDistributedWorkersHealth();

            if (healthyWorkers.length > 0) {
                console.log(`[Distributed] ${healthyWorkers.length} workers healthy, using distributed processing`);

                // Use the first healthy worker's main backend endpoint (distributed routes)
                const serverUrl = getNextServer(category);

                const formData = new FormData();
                formData.append('file', file);
                Object.entries(options).forEach(([key, value]) => {
                    formData.append(key, String(value));
                });

                const response = await axios.post(`${serverUrl}${distributedEndpoint}`, formData, {
                    headers: { 'Content-Type': 'multipart/form-data' },
                    timeout: 600000,
                    onUploadProgress: onProgress,
                });

                if (response.data.task_id) {
                    setServerForTask(response.data.task_id, serverUrl);
                    // Mark this task for potential fallback if it fails mid-processing
                    markTaskAsDistributed(response.data.task_id, file, endpoint, options, onProgress);
                    console.log(`[Distributed] ✅ SUCCESS! Task ${response.data.task_id} queued for distributed processing`);
                }

                return response.data;
            } else {
                console.log(`[Distributed] No healthy workers, falling back to normal...`);
            }
        } catch (error) {
            // Silent fail - log but don't throw
            console.warn(`[Distributed] ⚠️ Distributed processing failed, falling back silently...`, error);
        }
    } else {
        console.log(`[Distributed] File ${formatFileSize(file.size)} < 10MB, using normal processing`);
    }

    // Fallback: Use normal processing (existing HF/Northflank)
    console.log(`[Distributed] Using normal servers for processing`);
    return uploadFile(endpoint, file, options, onProgress, category);
}

// ==========================================
// VIDEO API
// ==========================================
export const videoApi = {
    convert: (file: File, outputFormat: string, options: Record<string, any> = {}, onProgress?: (e: AxiosProgressEvent) => void) =>
        uploadWithDistributedFallback(
            '/api/video/convert',
            '/api/video/convert-distributed',
            file,
            { output_format: outputFormat, ...options },
            onProgress,
            'video'
        ),

    extractAudio: (file: File, outputFormat: string, bitrate: string, onProgress?: (e: AxiosProgressEvent) => void) =>
        uploadFile('/api/video/extract-audio', file, { output_format: outputFormat, bitrate }, onProgress, 'video'),

    trim: (file: File, startTime: string, endTime: string, onProgress?: (e: AxiosProgressEvent) => void) =>
        uploadFile('/api/video/trim', file, { start_time: startTime, end_time: endTime }, onProgress, 'video'),

    compress: (file: File, quality: string, onProgress?: (e: AxiosProgressEvent) => void) =>
        uploadWithDistributedFallback(
            '/api/video/compress',
            '/api/video/compress-distributed',
            file,
            { quality },
            onProgress,
            'video'
        ),

    rotate: (file: File, rotation: string, onProgress?: (e: AxiosProgressEvent) => void) =>
        uploadFile('/api/video/rotate', file, { rotation }, onProgress, 'video'),

    merge: (files: File[], outputFormat: string, onProgress?: (e: AxiosProgressEvent) => void) =>
        uploadFiles('/api/video/merge', files, { output_format: outputFormat }, onProgress, 'video'),

    toGif: (file: File, fps: number, width?: number, startTime?: string, duration?: string, onProgress?: (e: AxiosProgressEvent) => void) =>
        uploadFile('/api/video/to-gif', file, { fps, width, start_time: startTime, duration }, onProgress, 'video'),

    speed: (file: File, speedFactor: number, preserveAudio: boolean, onProgress?: (e: AxiosProgressEvent) => void) =>
        uploadFile('/api/video/speed', file, { speed_factor: speedFactor, preserve_audio: preserveAudio }, onProgress, 'video'),

    mute: (file: File, onProgress?: (e: AxiosProgressEvent) => void) =>
        uploadFile('/api/video/mute', file, {}, onProgress, 'video'),

    toFrames: (file: File, outputFormat: string, frameRate?: number, quality?: number, onProgress?: (e: AxiosProgressEvent) => void) => {
        const params: Record<string, any> = { output_format: outputFormat };
        if (frameRate !== undefined && !isNaN(frameRate)) params.frame_rate = frameRate;
        if (quality !== undefined && !isNaN(quality)) params.quality = quality;
        return uploadFile('/api/video/to-frames', file, params, onProgress, 'video');
    },

    addMusic: async (videoFile: File, audioFile: File, replaceAudio: boolean, audioVolume: number, onProgress?: (e: AxiosProgressEvent) => void) => {
        // Validate both files
        const videoValidation = validateFile(videoFile, 'video');
        if (!videoValidation.valid) throw new Error(`Video: ${videoValidation.error}`);

        const audioValidation = validateFile(audioFile, 'audio');
        if (!audioValidation.valid) throw new Error(`Audio: ${audioValidation.error}`);

        const formData = new FormData();
        formData.append('video', videoFile);
        formData.append('audio', audioFile);
        formData.append('replace_audio', String(replaceAudio));
        formData.append('audio_volume', String(audioVolume));

        const response = await api.post('/api/video/add-music', formData, {
            headers: { 'Content-Type': 'multipart/form-data' },
            onUploadProgress: onProgress,
        });
        return response.data as UploadResponse;
    },

    aiFinder: async (file: File) => {
        const validation = validateFile(file, 'video');
        if (!validation.valid) throw new Error(validation.error);

        const formData = new FormData();
        formData.append('file', file);
        const response = await api.post('/api/video/ai-finder', formData, {
            headers: { 'Content-Type': 'multipart/form-data' },
        });
        return response.data;
    },
};

// ==========================================
// AUDIO API
// ==========================================
export const audioApi = {
    convert: (file: File, outputFormat: string, bitrate: string, onProgress?: (e: AxiosProgressEvent) => void) =>
        uploadFile('/api/audio/convert', file, { output_format: outputFormat, bitrate }, onProgress, 'audio'),

    trim: (file: File, startTime: string, endTime: string, fadeIn?: number, fadeOut?: number, onProgress?: (e: AxiosProgressEvent) => void) =>
        uploadFile('/api/audio/trim', file, { start_time: startTime, end_time: endTime, fade_in: fadeIn, fade_out: fadeOut }, onProgress, 'audio'),

    volume: (file: File, gain: number, normalize: boolean, onProgress?: (e: AxiosProgressEvent) => void) =>
        uploadFile('/api/audio/volume', file, { gain, normalize }, onProgress, 'audio'),

    detectBpm: async (file: File) => {
        const validation = validateFile(file, 'audio');
        if (!validation.valid) throw new Error(validation.error);

        const formData = new FormData();
        formData.append('file', file);
        const response = await api.post('/api/audio/bpm', formData, {
            headers: { 'Content-Type': 'multipart/form-data' },
        });
        return response.data;
    },
};

// ==========================================
// DOCUMENT API
// ==========================================
export const documentApi = {
    convert: (file: File, outputFormat: string, onProgress?: (e: AxiosProgressEvent) => void) =>
        uploadFile('/api/document/convert', file, { output_format: outputFormat }, onProgress, 'document'),

    mergePdf: (files: File[], onProgress?: (e: AxiosProgressEvent) => void) =>
        uploadFiles('/api/pdf/merge', files, {}, onProgress, 'document'),

    splitPdf: (file: File, pages: string, onProgress?: (e: AxiosProgressEvent) => void) =>
        uploadFile('/api/pdf/split', file, { pages }, onProgress, 'document'),

    compressPdf: (file: File, quality: string, onProgress?: (e: AxiosProgressEvent) => void) =>
        uploadFile('/api/pdf/compress', file, { quality }, onProgress, 'document'),

    protectPdf: (file: File, password: string, onProgress?: (e: AxiosProgressEvent) => void) =>
        uploadFile('/api/pdf/protect', file, { password }, onProgress, 'document'),

    unlockPdf: (file: File, password: string, onProgress?: (e: AxiosProgressEvent) => void) =>
        uploadFile('/api/pdf/unlock', file, { password }, onProgress, 'document'),

    toImage: (file: File, outputFormat: string, onProgress?: (e: AxiosProgressEvent) => void) =>
        uploadFile('/api/document/to-image', file, { output_format: outputFormat }, onProgress, 'document'),

    dataConvert: (file: File, outputFormat: string, onProgress?: (e: AxiosProgressEvent) => void) =>
        uploadFile('/api/document/data-convert', file, { output_format: outputFormat }, onProgress, 'document'),

    metadata: async (file: File, action: string = 'view') => {
        const validation = validateFile(file, 'document');
        if (!validation.valid) throw new Error(validation.error);

        const formData = new FormData();
        formData.append('file', file);
        formData.append('action', action);
        const response = await api.post('/api/document/metadata', formData, {
            headers: { 'Content-Type': 'multipart/form-data' },
        });
        return response.data;
    },

    textSave: async (content: string, filename: string) => {
        const formData = new FormData();
        formData.append('content', content);
        formData.append('filename', filename);
        const response = await api.post('/api/document/text-save', formData, {
            headers: { 'Content-Type': 'multipart/form-data' },
        });
        return response.data;
    },

    sizeAdjust: (file: File, mode: string, targetSize: number, onProgress?: (e: AxiosProgressEvent) => void) =>
        uploadFile('/api/document/size-adjust', file, { mode, target_size: targetSize }, onProgress, 'document'),
};

// Export utilities
export { formatFileSize };
export default api;
