'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import api from '@/lib/api';
import ToolContent from '@/components/ToolContent';

export default function DocumentMetadataClient() {
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [metadata, setMetadata] = useState<any>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setSelectedFile(file);
            setMetadata(null);
            setError('');
            setLoading(true);

            try {
                const formData = new FormData();
                formData.append('file', file);
                formData.append('action', 'view');

                const response = await api.post('/api/document/metadata', formData);
                setMetadata(response.data);
            } catch (err: any) {
                setError(err.response?.data?.detail || err.message || 'Failed to read metadata');
            } finally {
                setLoading(false);
            }
        }
    };

    return (
        <div className="container" style={{ paddingTop: '40px', paddingBottom: '60px' }}>
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} style={{ textAlign: 'center', marginBottom: '32px' }}>
                <h1 className="tool-title">Metadata Viewer</h1>
                <p style={{ color: 'var(--text-secondary)' }}>View document metadata and properties</p>
            </motion.div>

            <div style={{ maxWidth: '700px', margin: '0 auto' }}>
                <div className="glass-card" style={{ padding: '24px' }}>
                    <label style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '60px', border: '2px dashed var(--glass-border)', borderRadius: '12px', cursor: 'pointer', marginBottom: '20px' }}>
                        <input type="file" accept=".pdf,.doc,.docx" onChange={handleFileSelect} style={{ display: 'none' }} />
                        <span style={{ fontSize: '3rem', marginBottom: '16px' }}>📋</span>
                        <span style={{ color: 'var(--neon-blue)', fontWeight: 600 }}>{selectedFile ? selectedFile.name : 'Select a document'}</span>
                        <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem', marginTop: '8px' }}>PDF, DOC, DOCX supported</span>
                    </label>

                    {loading && (
                        <div style={{ textAlign: 'center', padding: '20px' }}>
                            <div className="spinner" style={{ margin: '0 auto 12px' }} />
                            <p style={{ color: 'var(--text-muted)' }}>Reading metadata...</p>
                        </div>
                    )}

                    {error && (
                        <div style={{ padding: '16px', background: 'rgba(255,100,100,0.1)', border: '1px solid rgba(255,100,100,0.3)', borderRadius: '8px', color: '#FF6B6B', textAlign: 'center' }}>
                            {error}
                        </div>
                    )}

                    {metadata && (
                        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
                            <h3 style={{ color: 'var(--text-primary)', marginBottom: '16px' }}>📄 Document Metadata</h3>

                            <div style={{ background: 'rgba(255,255,255,0.03)', borderRadius: '8px', overflow: 'hidden' }}>
                                {Object.entries(metadata.metadata || {}).map(([key, value]) => (
                                    <div key={key} style={{ display: 'flex', padding: '12px 16px', borderBottom: '1px solid var(--glass-border)' }}>
                                        <span style={{ flex: '0 0 150px', color: 'var(--text-muted)', fontSize: '0.85rem' }}>{key}</span>
                                        <span style={{ color: 'var(--text-primary)', fontSize: '0.85rem', wordBreak: 'break-all' }}>{String(value) || '-'}</span>
                                    </div>
                                ))}

                                {metadata.page_count && (
                                    <div style={{ display: 'flex', padding: '12px 16px', borderBottom: '1px solid var(--glass-border)' }}>
                                        <span style={{ flex: '0 0 150px', color: 'var(--text-muted)', fontSize: '0.85rem' }}>Page Count</span>
                                        <span style={{ color: 'var(--text-primary)', fontSize: '0.85rem' }}>{metadata.page_count}</span>
                                    </div>
                                )}
                            </div>

                            <button onClick={() => { setSelectedFile(null); setMetadata(null); }} className="btn btn-ghost" style={{ width: '100%', marginTop: '16px' }}>
                                View Another Document
                            </button>
                        </motion.div>
                    )}
                </div>
            </div>

            <ToolContent
                overview="Reveal the hidden information inside your files with our Metadata Viewer. Documents like PDFs and Word files often contain invisible data such as author name, creation date, software used, and edit history."
                features={[
                    "Comprehensive Extraction: Reads standard metadata fields from PDF, DOC, and DOCX files.",
                    "Privacy & Forensics: Useful for checking if a file contains personal info before sharing.",
                    "Details Revealed: See page counts, titles, authors, creation/mod dates, and generator software.",
                    "Simple & Fast: Just upload to view the data instantly."
                ]}
                howTo={[
                    { step: "Upload Document", description: "Select a PDF or Word document to analyze." },
                    { step: "Wait for Extraction", description: "Our engine parses the file header and property tags." },
                    { step: "View Metadata", description: "Read the extracted key-value pairs displayed in a clean list." }
                ]}
            />
        </div>
    );
}
