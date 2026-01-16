import axios, { AxiosError, AxiosProgressEvent } from 'axios';

// API Configuration
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

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
    status: 'queued' | 'processing' | 'complete' | 'failed' | 'cancelled';
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

// Generic file upload function with validation
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

    try {
        const response = await api.post(endpoint, formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
            onUploadProgress,
        });
        return response.data;
    } catch (error) {
        if (error instanceof AxiosError) {
            throw new Error(parseErrorResponse(error));
        }
        throw error;
    }
};

// Multiple files upload with validation
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

    try {
        const response = await api.post(endpoint, formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
            onUploadProgress,
        });
        return response.data;
    } catch (error) {
        if (error instanceof AxiosError) {
            throw new Error(parseErrorResponse(error));
        }
        throw error;
    }
};

// Check task status
export const getTaskStatus = async (taskId: string): Promise<TaskResponse> => {
    const response = await api.get(`/api/status/${taskId}`);
    return response.data;
};

// Poll for task completion
export const pollTaskStatus = async (
    taskId: string,
    onProgress?: (task: TaskResponse) => void,
    intervalMs = 2000,
    maxAttempts = 180 // 6 minutes max polling
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

// Get download URL
export const getDownloadUrl = (taskId: string): string => {
    return `${API_BASE_URL}/api/download/${taskId}`;
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
};

// ==========================================
// VIDEO API
// ==========================================
export const videoApi = {
    convert: (file: File, outputFormat: string, options: Record<string, any> = {}, onProgress?: (e: AxiosProgressEvent) => void) =>
        uploadFile('/api/video/convert', file, { output_format: outputFormat, ...options }, onProgress, 'video'),

    extractAudio: (file: File, outputFormat: string, bitrate: string, onProgress?: (e: AxiosProgressEvent) => void) =>
        uploadFile('/api/video/extract-audio', file, { output_format: outputFormat, bitrate }, onProgress, 'video'),

    trim: (file: File, startTime: string, endTime: string, onProgress?: (e: AxiosProgressEvent) => void) =>
        uploadFile('/api/video/trim', file, { start_time: startTime, end_time: endTime }, onProgress, 'video'),

    compress: (file: File, quality: string, onProgress?: (e: AxiosProgressEvent) => void) =>
        uploadFile('/api/video/compress', file, { quality }, onProgress, 'video'),

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
        uploadFile('/api/data/convert', file, { output_format: outputFormat }, onProgress, 'document'),

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
