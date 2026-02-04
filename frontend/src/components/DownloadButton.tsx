'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Download, Check, Loader2, FileDown } from 'lucide-react';

interface DownloadButtonProps {
    fileName: string;
    fileSize?: string;
    downloadUrl: string;
    disabled?: boolean;
}

export default function DownloadButton({
    fileName,
    fileSize,
    downloadUrl,
    disabled = false,
}: DownloadButtonProps) {
    const [isDownloading, setIsDownloading] = useState(false);
    const [downloaded, setDownloaded] = useState(false);

    const handleDownload = () => {
        if (disabled || isDownloading) return;

        setIsDownloading(true);

        try {
            // Use direct link download - this triggers browser's native download manager
            // which shows proper download progress in the browser's download popup
            const link = document.createElement('a');
            link.href = downloadUrl;
            link.download = fileName || 'download';

            // Setting target to _blank helps with cross-origin downloads
            // The server should send Content-Disposition: attachment header
            link.target = '_blank';
            link.rel = 'noopener noreferrer';

            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);

            setDownloaded(true);
            setTimeout(() => setDownloaded(false), 3000);
        } catch (error) {
            console.error('Download error:', error);
            alert('Download failed. Please try again.');
        } finally {
            setIsDownloading(false);
        }
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass-card"
            style={{
                padding: '24px',
                marginTop: '20px',
                textAlign: 'center',
                borderColor: 'rgba(68, 255, 68, 0.3)',
            }}
        >
            {/* Success Icon */}
            <div
                style={{
                    width: '64px',
                    height: '64px',
                    borderRadius: '50%',
                    background: 'rgba(68, 255, 68, 0.1)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    margin: '0 auto 20px',
                }}
            >
                <Check size={32} color="#44FF44" />
            </div>

            {/* Title */}
            <h3
                style={{
                    fontSize: '1.25rem',
                    fontWeight: 600,
                    color: '#44FF44',
                    marginBottom: '8px',
                }}
            >
                ✓ Your file is ready!
            </h3>

            {/* File Info */}
            <div
                style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px',
                    marginBottom: '20px',
                }}
            >
                <FileDown size={18} color="#00D9FF" />
                <span
                    style={{
                        fontSize: '0.95rem',
                        color: 'var(--text-primary)',
                        fontWeight: 500,
                    }}
                >
                    {fileName}
                </span>
                {fileSize && (
                    <span
                        style={{
                            fontSize: '0.85rem',
                            color: 'var(--text-muted)',
                        }}
                    >
                        ({fileSize})
                    </span>
                )}
            </div>

            {/* Download Button */}
            <motion.button
                onClick={handleDownload}
                disabled={disabled || isDownloading}
                whileHover={{ scale: disabled ? 1 : 1.02 }}
                whileTap={{ scale: disabled ? 1 : 0.98 }}
                style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '10px',
                    padding: '14px 32px',
                    fontSize: '1rem',
                    fontWeight: 600,
                    background: downloaded
                        ? 'linear-gradient(135deg, #44FF44, #22CC22)'
                        : 'transparent',
                    color: downloaded ? '#0F0F0F' : '#00D9FF',
                    border: downloaded ? 'none' : '2px solid #00D9FF',
                    borderRadius: '8px',
                    cursor: disabled ? 'not-allowed' : 'pointer',
                    opacity: disabled ? 0.5 : 1,
                    transition: 'all 0.3s ease',
                    minWidth: '200px',
                }}
            >
                {isDownloading ? (
                    <>
                        <Loader2 size={20} className="animate-spin" style={{ animation: 'spin 1s linear infinite' }} />
                        Downloading...
                    </>
                ) : downloaded ? (
                    <>
                        <Check size={20} />
                        Downloaded!
                    </>
                ) : (
                    <>
                        <Download size={20} />
                        Download File
                    </>
                )}
            </motion.button>

            {/* Convert Another */}
            <p
                style={{
                    marginTop: '16px',
                    fontSize: '0.85rem',
                    color: 'var(--text-muted)',
                }}
            >
                Or convert another file...
            </p>
        </motion.div>
    );
}
