'use client';

import { useCallback, useState } from 'react';
import { useDropzone, Accept } from 'react-dropzone';
import { motion } from 'framer-motion';
import { Upload, File, X, AlertCircle } from 'lucide-react';

interface UploadZoneProps {
    accept?: Accept;
    maxSize?: number; // in MB
    maxFiles?: number;
    onFilesSelected: (files: File[]) => void;
    supportedFormatsText?: string;
}

export default function UploadZone({
    accept,
    maxSize = 50,
    maxFiles = 40,
    onFilesSelected,
    supportedFormatsText = 'Drag files here or click to browse',
}: UploadZoneProps) {
    const [files, setFiles] = useState<File[]>([]);
    const [error, setError] = useState<string | null>(null);

    const onDrop = useCallback(
        (acceptedFiles: File[], rejectedFiles: any[]) => {
            setError(null);

            // Handle rejected files
            if (rejectedFiles.length > 0) {
                const rejection = rejectedFiles[0];
                if (rejection.errors[0]?.code === 'file-too-large') {
                    setError(`File too large. Maximum size is ${maxSize}MB`);
                } else if (rejection.errors[0]?.code === 'file-invalid-type') {
                    setError('Invalid file type');
                } else {
                    setError(rejection.errors[0]?.message || 'File rejected');
                }
                return;
            }

            // Check max files
            if (acceptedFiles.length > maxFiles) {
                setError(`Maximum ${maxFiles} files allowed`);
                return;
            }

            setFiles(acceptedFiles);
            onFilesSelected(acceptedFiles);
        },
        [maxSize, maxFiles, onFilesSelected]
    );

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop,
        accept,
        maxSize: maxSize * 1024 * 1024,
        maxFiles,
    });

    const removeFile = (index: number) => {
        const newFiles = files.filter((_, i) => i !== index);
        setFiles(newFiles);
        onFilesSelected(newFiles);
    };

    const formatFileSize = (bytes: number): string => {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    };

    return (
        <div>
            <div
                {...getRootProps()}
                className={`upload-zone ${isDragActive ? 'drag-active' : ''}`}
                style={{
                    cursor: 'pointer',
                    transition: 'transform 0.1s ease',
                }}
                onMouseEnter={(e) => (e.currentTarget.style.transform = 'scale(1.01)')}
                onMouseLeave={(e) => (e.currentTarget.style.transform = 'scale(1)')}
            >
                <input {...getInputProps()} />

                <div
                    style={{
                        width: '64px',
                        height: '64px',
                        borderRadius: '50%',
                        background: isDragActive
                            ? 'rgba(0, 255, 255, 0.2)'
                            : 'rgba(0, 217, 255, 0.1)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        marginBottom: '16px',
                        transition: 'all 0.2s ease',
                    }}
                >
                    <Upload
                        size={28}
                        color={isDragActive ? '#00FFFF' : '#00D9FF'}
                    />
                </div>

                <p
                    style={{
                        fontSize: '1.1rem',
                        fontWeight: 500,
                        color: isDragActive ? '#00FFFF' : 'var(--text-primary)',
                        marginBottom: '8px',
                    }}
                >
                    {isDragActive ? 'Drop files here...' : '📁 Drag files here or click to browse'}
                </p>

                <p
                    style={{
                        fontSize: '0.875rem',
                        color: 'var(--text-muted)',
                    }}
                >
                    {supportedFormatsText} | Max size: {maxSize}MB
                </p>
            </div>

            {/* Error Display */}
            {error && (
                <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        padding: '12px 16px',
                        marginTop: '16px',
                        background: 'rgba(255, 68, 68, 0.1)',
                        border: '1px solid rgba(255, 68, 68, 0.3)',
                        borderRadius: '8px',
                        color: '#FF4444',
                    }}
                >
                    <AlertCircle size={18} />
                    <span>{error}</span>
                </motion.div>
            )}

            {/* Selected Files List */}
            {files.length > 0 && (
                <div style={{ marginTop: '20px' }}>
                    <p
                        style={{
                            fontSize: '0.875rem',
                            color: 'var(--text-secondary)',
                            marginBottom: '12px',
                        }}
                    >
                        Selected files ({files.length})
                    </p>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        {files.map((file, index) => (
                            <motion.div
                                key={`${file.name}-${index}`}
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: index * 0.05 }}
                                className="glass-card"
                                style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'space-between',
                                    padding: '12px 16px',
                                }}
                            >
                                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                    <File size={20} color="#00D9FF" />
                                    <div>
                                        <p
                                            style={{
                                                fontSize: '0.9rem',
                                                fontWeight: 500,
                                                color: 'var(--text-primary)',
                                                wordBreak: 'break-all',
                                            }}
                                        >
                                            {file.name}
                                        </p>
                                        <p
                                            style={{
                                                fontSize: '0.75rem',
                                                color: 'var(--text-muted)',
                                            }}
                                        >
                                            {formatFileSize(file.size)}
                                        </p>
                                    </div>
                                </div>
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        removeFile(index);
                                    }}
                                    style={{
                                        background: 'rgba(255, 68, 68, 0.1)',
                                        border: 'none',
                                        borderRadius: '6px',
                                        padding: '6px',
                                        cursor: 'pointer',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        transition: 'all 0.2s ease',
                                    }}
                                    onMouseEnter={(e) => {
                                        e.currentTarget.style.background = 'rgba(255, 68, 68, 0.2)';
                                    }}
                                    onMouseLeave={(e) => {
                                        e.currentTarget.style.background = 'rgba(255, 68, 68, 0.1)';
                                    }}
                                >
                                    <X size={16} color="#FF4444" />
                                </button>
                            </motion.div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}
