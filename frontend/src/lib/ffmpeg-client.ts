'use client';

import { FFmpeg } from '@ffmpeg/ffmpeg';
import { fetchFile, toBlobURL } from '@ffmpeg/util';

// Singleton FFmpeg instance
let ffmpeg: FFmpeg | null = null;
let ffmpegLoaded = false;
let loadingPromise: Promise<void> | null = null;

/**
 * Check if FFmpeg.wasm is supported in this browser
 */
export function isFFmpegSupported(): boolean {
    return typeof SharedArrayBuffer !== 'undefined' && typeof Worker !== 'undefined';
}

/**
 * Convert FFmpeg FileData to ArrayBuffer (handles SharedArrayBuffer)
 */
function toArrayBuffer(data: Uint8Array | string): ArrayBuffer {
    if (typeof data === 'string') {
        return new TextEncoder().encode(data).buffer as ArrayBuffer;
    }
    // Copy to a new ArrayBuffer to avoid SharedArrayBuffer compatibility issues
    const buffer = new ArrayBuffer(data.byteLength);
    new Uint8Array(buffer).set(data);
    return buffer;
}

/**
 * Initialize FFmpeg.wasm (lazy load)
 */
async function initFFmpeg(onProgress?: (message: string) => void): Promise<FFmpeg> {
    if (ffmpeg && ffmpegLoaded) {
        return ffmpeg;
    }

    if (loadingPromise) {
        await loadingPromise;
        return ffmpeg!;
    }

    ffmpeg = new FFmpeg();

    ffmpeg.on('log', ({ message }) => {
        console.log('[FFmpeg]', message);
    });

    ffmpeg.on('progress', ({ progress }) => {
        if (onProgress) {
            onProgress(`Processing: ${Math.round(progress * 100)}%`);
        }
    });

    loadingPromise = (async () => {
        onProgress?.('Loading FFmpeg (first time only)...');

        // Load FFmpeg core from CDN
        const baseURL = 'https://unpkg.com/@ffmpeg/core@0.12.6/dist/esm';

        await ffmpeg!.load({
            coreURL: await toBlobURL(`${baseURL}/ffmpeg-core.js`, 'text/javascript'),
            wasmURL: await toBlobURL(`${baseURL}/ffmpeg-core.wasm`, 'application/wasm'),
        });

        ffmpegLoaded = true;
        onProgress?.('FFmpeg ready!');
    })();

    await loadingPromise;
    return ffmpeg;
}

/**
 * Convert video format using browser's FFmpeg.wasm
 */
export async function convertVideoClient(
    file: File,
    outputFormat: string,
    onProgress?: (message: string) => void
): Promise<Blob> {
    if (!isFFmpegSupported()) {
        throw new Error('Browser does not support FFmpeg.wasm (needs SharedArrayBuffer)');
    }

    const ff = await initFFmpeg(onProgress);

    const inputName = `input.${file.name.split('.').pop() || 'mp4'}`;
    const outputName = `output.${outputFormat}`;

    onProgress?.('Reading input file...');
    await ff.writeFile(inputName, await fetchFile(file));

    onProgress?.('Converting video...');

    // Run FFmpeg conversion
    await ff.exec([
        '-i', inputName,
        '-c:v', 'libx264',  // Use H.264 codec
        '-preset', 'fast',   // Fast encoding
        '-crf', '28',        // Quality (lower = better, 23 is default)
        '-c:a', 'aac',       // AAC audio
        '-b:a', '128k',      // Audio bitrate
        outputName
    ]);

    onProgress?.('Reading output file...');
    const data = await ff.readFile(outputName);

    // Cleanup
    await ff.deleteFile(inputName);
    await ff.deleteFile(outputName);

    onProgress?.('Done!');

    // Convert to Blob
    const mimeTypes: Record<string, string> = {
        'mp4': 'video/mp4',
        'webm': 'video/webm',
        'avi': 'video/x-msvideo',
        'mov': 'video/quicktime',
        'mkv': 'video/x-matroska',
    };

    return new Blob([toArrayBuffer(data as Uint8Array)], { type: mimeTypes[outputFormat] || 'video/mp4' });
}

/**
 * Compress video using browser's FFmpeg.wasm
 */
export async function compressVideoClient(
    file: File,
    quality: 'low' | 'medium' | 'high',
    onProgress?: (message: string) => void
): Promise<Blob> {
    if (!isFFmpegSupported()) {
        throw new Error('Browser does not support FFmpeg.wasm');
    }

    const ff = await initFFmpeg(onProgress);

    const inputName = `input.${file.name.split('.').pop() || 'mp4'}`;
    const outputName = 'output.mp4';

    // CRF values: lower = better quality, bigger file
    const crfValues = { low: 35, medium: 28, high: 23 };
    const crf = crfValues[quality];

    onProgress?.('Reading input file...');
    await ff.writeFile(inputName, await fetchFile(file));

    onProgress?.('Compressing video...');

    await ff.exec([
        '-i', inputName,
        '-c:v', 'libx264',
        '-preset', 'fast',
        '-crf', String(crf),
        '-c:a', 'aac',
        '-b:a', quality === 'low' ? '64k' : quality === 'medium' ? '128k' : '192k',
        outputName
    ]);

    onProgress?.('Reading output file...');
    const data = await ff.readFile(outputName);

    await ff.deleteFile(inputName);
    await ff.deleteFile(outputName);

    onProgress?.('Done!');

    return new Blob([toArrayBuffer(data as Uint8Array)], { type: 'video/mp4' });
}

/**
 * Extract audio from video using browser's FFmpeg.wasm
 */
export async function extractAudioClient(
    file: File,
    outputFormat: 'mp3' | 'aac' | 'wav',
    onProgress?: (message: string) => void
): Promise<Blob> {
    if (!isFFmpegSupported()) {
        throw new Error('Browser does not support FFmpeg.wasm');
    }

    const ff = await initFFmpeg(onProgress);

    const inputName = `input.${file.name.split('.').pop() || 'mp4'}`;
    const outputName = `output.${outputFormat}`;

    onProgress?.('Reading input file...');
    await ff.writeFile(inputName, await fetchFile(file));

    onProgress?.('Extracting audio...');

    const audioCodec = outputFormat === 'mp3' ? 'libmp3lame' : outputFormat === 'aac' ? 'aac' : 'pcm_s16le';

    await ff.exec([
        '-i', inputName,
        '-vn',  // No video
        '-c:a', audioCodec,
        '-b:a', '192k',
        outputName
    ]);

    onProgress?.('Reading output file...');
    const data = await ff.readFile(outputName);

    await ff.deleteFile(inputName);
    await ff.deleteFile(outputName);

    onProgress?.('Done!');

    const mimeTypes: Record<string, string> = {
        'mp3': 'audio/mpeg',
        'aac': 'audio/aac',
        'wav': 'audio/wav',
    };

    return new Blob([toArrayBuffer(data as Uint8Array)], { type: mimeTypes[outputFormat] });
}

/**
 * Trim video using browser's FFmpeg.wasm
 */
export async function trimVideoClient(
    file: File,
    startTime: string,  // Format: "00:00:00" or seconds
    endTime: string,
    onProgress?: (message: string) => void
): Promise<Blob> {
    if (!isFFmpegSupported()) {
        throw new Error('Browser does not support FFmpeg.wasm');
    }

    const ff = await initFFmpeg(onProgress);

    const inputName = `input.${file.name.split('.').pop() || 'mp4'}`;
    const outputName = 'output.mp4';

    onProgress?.('Reading input file...');
    await ff.writeFile(inputName, await fetchFile(file));

    onProgress?.('Trimming video...');

    await ff.exec([
        '-i', inputName,
        '-ss', startTime,
        '-to', endTime,
        '-c', 'copy',  // Fast copy without re-encoding
        outputName
    ]);

    onProgress?.('Reading output file...');
    const data = await ff.readFile(outputName);

    await ff.deleteFile(inputName);
    await ff.deleteFile(outputName);

    onProgress?.('Done!');

    return new Blob([toArrayBuffer(data as Uint8Array)], { type: 'video/mp4' });
}
