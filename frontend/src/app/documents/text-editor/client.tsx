'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import ToolContent from '@/components/ToolContent';

export default function TextEditorClient() {
    const [content, setContent] = useState('');
    const [fileName, setFileName] = useState('untitled.txt');
    const [wordCount, setWordCount] = useState(0);
    const [lineCount, setLineCount] = useState(0);
    const [charCount, setCharCount] = useState(0);
    const [findText, setFindText] = useState('');
    const [replaceText, setReplaceText] = useState('');
    const [showFindReplace, setShowFindReplace] = useState(false);

    useEffect(() => {
        setCharCount(content.length);
        setLineCount(content.split('\n').length);
        setWordCount(content.trim() ? content.trim().split(/\s+/).length : 0);
    }, [content]);

    const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setFileName(file.name);
            const reader = new FileReader();
            reader.onload = (e) => setContent(e.target?.result as string || '');
            reader.readAsText(file);
        }
    };

    const handleDownload = () => {
        const blob = new Blob([content], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = fileName;
        a.click();
        URL.revokeObjectURL(url);
    };

    const handleFindReplace = () => {
        if (findText) {
            setContent(content.replaceAll(findText, replaceText));
        }
    };

    return (
        <div className="container" style={{ paddingTop: '40px', paddingBottom: '60px' }}>
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} style={{ textAlign: 'center', marginBottom: '24px' }}>
                <h1 className="tool-title">Text Editor</h1>
                <p style={{ color: 'var(--text-secondary)' }}>Lightweight in-browser text and code editor</p>
            </motion.div>

            <div style={{ maxWidth: '900px', margin: '0 auto' }}>
                {/* Toolbar */}
                <div className="glass-card" style={{ padding: '12px 16px', marginBottom: '16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <label style={{ cursor: 'pointer' }}>
                            <input type="file" accept=".txt,.md,.json,.csv,.js,.py,.html,.css,.xml" onChange={handleFileUpload} style={{ display: 'none' }} />
                            <span className="btn btn-ghost" style={{ padding: '8px 12px', fontSize: '0.85rem' }}>📂 Open File</span>
                        </label>
                        <button onClick={handleDownload} className="btn btn-ghost" style={{ padding: '8px 12px', fontSize: '0.85rem' }}>💾 Save</button>
                        <button onClick={() => setShowFindReplace(!showFindReplace)} className="btn btn-ghost" style={{ padding: '8px 12px', fontSize: '0.85rem' }}>🔍 Find & Replace</button>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '16px', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                        <span>{lineCount} lines</span>
                        <span>{wordCount} words</span>
                        <span>{charCount} chars</span>
                    </div>
                </div>

                {/* Find & Replace Panel */}
                {showFindReplace && (
                    <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="glass-card" style={{ padding: '16px', marginBottom: '16px' }}>
                        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', alignItems: 'center' }}>
                            <input type="text" placeholder="Find..." value={findText} onChange={(e) => setFindText(e.target.value)} style={{ flex: 1, minWidth: '150px', padding: '8px 12px', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--glass-border)', borderRadius: '6px', color: 'var(--text-primary)' }} />
                            <input type="text" placeholder="Replace with..." value={replaceText} onChange={(e) => setReplaceText(e.target.value)} style={{ flex: 1, minWidth: '150px', padding: '8px 12px', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--glass-border)', borderRadius: '6px', color: 'var(--text-primary)' }} />
                            <button onClick={handleFindReplace} className="btn btn-primary" style={{ padding: '8px 16px' }}>Replace All</button>
                        </div>
                    </motion.div>
                )}

                {/* Editor */}
                <div className="glass-card" style={{ padding: '0', overflow: 'hidden' }}>
                    <div style={{ padding: '8px 16px', borderBottom: '1px solid var(--glass-border)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span style={{ fontSize: '0.9rem', color: 'var(--text-primary)' }}>📄</span>
                        <input type="text" value={fileName} onChange={(e) => setFileName(e.target.value)} style={{ background: 'transparent', border: 'none', color: 'var(--text-primary)', fontSize: '0.9rem', fontWeight: 500, outline: 'none' }} />
                    </div>
                    <textarea value={content} onChange={(e) => setContent(e.target.value)} placeholder="Start typing or open a file..." style={{ width: '100%', minHeight: '500px', padding: '16px', background: 'rgba(0, 0, 0, 0.3)', border: 'none', outline: 'none', color: 'var(--text-primary)', fontFamily: 'monospace', fontSize: '14px', lineHeight: 1.6, resize: 'vertical' }} />
                </div>
            </div>

            <ToolContent
                overview="A lightweight, distraction-free text and code editor that runs entirely in your browser. Perfect for quick edits, writing code snippets, or cleaning up data."
                features={[
                    "Browser-Based: No software to install; opens instantly.",
                    "Live Stats: Tracks characters, words, and lines in real-time.",
                    "Find & Replace: Quickly modify text with a simple search tool.",
                    "Multi-Format: Open and edit TXT, MD, JSON, HTML, CSS, PY, and more.",
                    "Private: Your text stays in your browser's memory."
                ]}
                howTo={[
                    { step: "Start Writing", description: "Type directly or click 'Open File' to upload an existing document." },
                    { step: "Edit", description: "Use the editor to modifying text, find/replace, or copy content." },
                    { step: "Save", description: "Click 'Save' to download your work as a file." }
                ]}
            />
        </div>
    );
}
