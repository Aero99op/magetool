'use client';

import { useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import { imageApi, pollTaskStatus, getDownloadUrl, formatFileSize, startProcessing } from '@/lib/api';
import ToolContent from '@/components/ToolContent';

export default function OCRScannerClient() {
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [imageUrl, setImageUrl] = useState<string>('');
    const [extractedText, setExtractedText] = useState<string>('');
    const [isProcessing, setIsProcessing] = useState(false);
    const [error, setError] = useState<string>('');
    const [outputFormat, setOutputFormat] = useState('txt');

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setSelectedFile(file);
            setImageUrl(URL.createObjectURL(file));
            setExtractedText('');
            setError('');
        }
    };

    const handleExtract = async () => {
        if (!selectedFile) return;
        setIsProcessing(true);
        setError('');

        try {
            const response = await imageApi.ocr(selectedFile, outputFormat);
            const taskId = response.task_id;

            await startProcessing(taskId);
            const result = await pollTaskStatus(taskId);

            // Fetch the extracted text from the download URL
            const downloadUrl = getDownloadUrl(taskId);
            const textResponse = await fetch(downloadUrl);
            const text = await textResponse.text();

            setExtractedText(text);
        } catch (err: any) {
            setError(err.response?.data?.detail || err.message || 'OCR extraction failed');
        } finally {
            setIsProcessing(false);
        }
    };

    const copyToClipboard = () => {
        navigator.clipboard.writeText(extractedText);
    };

    const downloadText = () => {
        const blob = new Blob([extractedText], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${selectedFile?.name || 'extracted'}_text.txt`;
        a.click();
        URL.revokeObjectURL(url);
    };

    return (
        <div className="container" style={{ paddingTop: '40px', paddingBottom: '60px' }}>
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} style={{ textAlign: 'center', marginBottom: '32px' }}>
                <h1 className="tool-title">OCR Scanner</h1>
                <p style={{ color: 'var(--text-secondary)' }}>Extract text from images using pytesseract OCR</p>
            </motion.div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px', maxWidth: '1000px', margin: '0 auto' }}>
                <div className="glass-card" style={{ padding: '24px' }}>
                    <h3 style={{ marginBottom: '16px', color: 'var(--text-primary)' }}>Upload Image</h3>
                    <label style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '40px', border: '2px dashed var(--glass-border)', borderRadius: '12px', cursor: 'pointer', transition: 'all 0.2s' }}>
                        <input type="file" accept="image/*" onChange={handleFileSelect} style={{ display: 'none' }} />
                        <span style={{ fontSize: '2.5rem', marginBottom: '12px' }}>📷</span>
                        <span style={{ color: 'var(--text-secondary)' }}>Click or drop image here</span>
                    </label>

                    {imageUrl && (
                        <div style={{ marginTop: '16px' }}>
                            <img src={imageUrl} alt="Preview" style={{ width: '100%', borderRadius: '8px', maxHeight: '300px', objectFit: 'contain' }} />

                            <div style={{ marginTop: '16px', marginBottom: '16px' }}>
                                <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Output Format</label>
                                <select value={outputFormat} onChange={(e) => setOutputFormat(e.target.value)} style={{ width: '100%', padding: '10px', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--glass-border)', borderRadius: '6px', color: 'var(--text-primary)' }}>
                                    <option value="txt">Plain Text (.txt)</option>
                                    <option value="json">JSON (.json)</option>
                                </select>
                            </div>

                            <button onClick={handleExtract} disabled={isProcessing} className="btn btn-primary" style={{ width: '100%' }}>
                                {isProcessing ? '⏳ Extracting Text...' : '🔍 Extract Text'}
                            </button>
                        </div>
                    )}

                    {error && (
                        <div style={{ marginTop: '12px', padding: '12px', background: 'rgba(255,100,100,0.1)', border: '1px solid rgba(255,100,100,0.3)', borderRadius: '8px', color: '#FF6B6B', fontSize: '0.85rem' }}>
                            {error}
                        </div>
                    )}
                </div>

                <div className="glass-card" style={{ padding: '24px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                        <h3 style={{ color: 'var(--text-primary)' }}>Extracted Text</h3>
                        {extractedText && (
                            <div style={{ display: 'flex', gap: '8px' }}>
                                <button onClick={copyToClipboard} className="btn btn-ghost" style={{ padding: '6px 12px', fontSize: '0.8rem' }}>📋 Copy</button>
                                <button onClick={downloadText} className="btn btn-ghost" style={{ padding: '6px 12px', fontSize: '0.8rem' }}>💾 Download</button>
                            </div>
                        )}
                    </div>
                    <textarea value={extractedText} readOnly placeholder="Extracted text will appear here..." style={{ width: '100%', minHeight: '300px', padding: '16px', background: 'rgba(255,255,255,0.03)', border: '1px solid var(--glass-border)', borderRadius: '8px', color: 'var(--text-primary)', resize: 'vertical', fontFamily: 'monospace' }} />
                </div>
            </div>

            <ToolContent
                overview="Extract text from images automatically with our Optical Character Recognition (OCR) tool. Perfect for digitizing documents, receipts, or notes from photos."
                features={[
                    "High Accuracy: Uses advanced Tesseract OCR engine.",
                    "Formatted Output: Get results as plain text or structured JSON.",
                    "Multi-language Support: Recognizes text in various languages.",
                    "Easy Export: Copy to clipboard or download as .txt file."
                ]}
                howTo={[
                    { step: "Upload Image", description: "Select a photo containing text." },
                    { step: "Select Format", description: "Choose Text or JSON output." },
                    { step: "Extract", description: "Wait for the AI to read the text." },
                    { step: "Export", description: "Copy or download the result." }
                ]}
            />
        </div>
    );
}
