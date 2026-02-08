/**
 * Client-side Background Remover using Transformers.js
 * Uses RMBG-1.4 model - runs entirely in browser
 * No API key needed, FREE, works like remove.bg
 * 
 * IMPORTANT: This file uses dynamic imports to avoid SSR issues with onnxruntime
 */

// Type definitions for transformers.js
interface TransformersModule {
    AutoModel: any;
    AutoProcessor: any;
    RawImage: any;
    env: any;
}

// Cache for model and processor
let transformers: TransformersModule | null = null;
let model: any = null;
let processor: any = null;
let isLoading = false;
let loadPromise: Promise<void> | null = null;

export interface BackgroundRemovalProgress {
    stage: 'loading_model' | 'processing' | 'complete';
    progress: number;
    message: string;
}

/**
 * Dynamically load transformers.js (browser-only)
 */
async function getTransformers(): Promise<TransformersModule> {
    if (transformers) return transformers;

    // Dynamic import to avoid SSR issues with onnxruntime-node
    const module = await import('@huggingface/transformers');

    // Configure for browser usage
    module.env.allowLocalModels = false;
    module.env.useBrowserCache = true;
    // Force WASM backend (more compatible than WebGPU for now)
    module.env.backends.onnx.wasm.numThreads = 1;

    transformers = module;
    return module;
}

/**
 * Initialize the RMBG model (cached for subsequent uses)
 */
async function initializeModel(onProgress?: (p: BackgroundRemovalProgress) => void): Promise<void> {
    if (model && processor) return;

    if (isLoading && loadPromise) {
        await loadPromise;
        return;
    }

    isLoading = true;

    loadPromise = (async () => {
        try {
            onProgress?.({
                stage: 'loading_model',
                progress: 10,
                message: 'Loading AI model (first time takes ~15-30s)...'
            });

            const { AutoModel, AutoProcessor } = await getTransformers();

            onProgress?.({
                stage: 'loading_model',
                progress: 15,
                message: 'Downloading AI model...'
            });

            // Load the RMBG-1.4 model from HuggingFace
            model = await AutoModel.from_pretrained('briaai/RMBG-1.4', {
                device: 'wasm', // Use WASM for broader compatibility
                progress_callback: (progress: any) => {
                    if (progress.status === 'downloading' || progress.status === 'progress') {
                        const pct = progress.progress || 30;
                        onProgress?.({
                            stage: 'loading_model',
                            progress: Math.min(55, 15 + pct * 0.4),
                            message: `Downloading model: ${Math.round(pct)}%`
                        });
                    }
                }
            });

            onProgress?.({
                stage: 'loading_model',
                progress: 60,
                message: 'Loading image processor...'
            });

            processor = await AutoProcessor.from_pretrained('briaai/RMBG-1.4');

            onProgress?.({
                stage: 'loading_model',
                progress: 70,
                message: 'Model ready!'
            });

        } finally {
            isLoading = false;
        }
    })();

    await loadPromise;
}

/**
 * Remove background from an image file
 * Returns a Blob with transparent PNG
 */
export async function removeBackground(
    imageFile: File,
    onProgress?: (p: BackgroundRemovalProgress) => void
): Promise<Blob> {
    // Ensure we're in the browser
    if (typeof window === 'undefined') {
        throw new Error('Background removal only works in browser');
    }

    // Initialize model if needed
    await initializeModel(onProgress);

    onProgress?.({
        stage: 'processing',
        progress: 75,
        message: 'Processing image...'
    });

    // Load and process the image
    const imageUrl = URL.createObjectURL(imageFile);

    try {
        const { RawImage } = await getTransformers();
        const image = await RawImage.fromURL(imageUrl);

        onProgress?.({
            stage: 'processing',
            progress: 80,
            message: 'Running AI segmentation...'
        });

        // Process image with the model
        const { pixel_values } = await processor(image);
        const { output } = await model({ input: pixel_values });

        onProgress?.({
            stage: 'processing',
            progress: 90,
            message: 'Creating transparent image...'
        });

        // Get mask from output
        const maskData = output.data;
        const [, , height, width] = output.dims;

        // Create canvas for final result
        const canvas = document.createElement('canvas');
        canvas.width = image.width;
        canvas.height = image.height;
        const ctx = canvas.getContext('2d')!;

        // Draw original image
        const img = new Image();
        await new Promise<void>((resolve, reject) => {
            img.onload = () => resolve();
            img.onerror = reject;
            img.src = imageUrl;
        });
        ctx.drawImage(img, 0, 0);

        // Apply mask for transparency
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const data = imageData.data;

        // Scale mask to image dimensions
        for (let y = 0; y < canvas.height; y++) {
            for (let x = 0; x < canvas.width; x++) {
                // Map to mask coordinates  
                const maskX = Math.floor(x * width / canvas.width);
                const maskY = Math.floor(y * height / canvas.height);
                const maskIdx = maskY * width + maskX;

                // Get alpha from mask (0-1 range)
                const alpha = maskData[maskIdx] || 0;

                // Apply to image alpha channel
                const idx = (y * canvas.width + x) * 4;
                data[idx + 3] = Math.round(alpha * 255);
            }
        }

        ctx.putImageData(imageData, 0, 0);

        onProgress?.({
            stage: 'complete',
            progress: 100,
            message: 'Done!'
        });

        // Convert canvas to blob
        return new Promise((resolve, reject) => {
            canvas.toBlob((blob) => {
                if (blob) {
                    resolve(blob);
                } else {
                    reject(new Error('Failed to create image'));
                }
            }, 'image/png');
        });

    } finally {
        URL.revokeObjectURL(imageUrl);
    }
}

/**
 * Check if WebGPU is available for faster processing
 */
export function isWebGPUAvailable(): boolean {
    if (typeof window === 'undefined') return false;
    return 'gpu' in navigator;
}

/**
 * Get estimated processing time based on device capabilities
 */
export function getEstimatedTime(): string {
    if (isWebGPUAvailable()) {
        return '10-20 seconds';
    }
    return '20-45 seconds';
}
