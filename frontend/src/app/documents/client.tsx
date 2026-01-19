'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import {
    FileText, FilePlus, FileX, Archive, Lock,
    Unlock, Image, FileJson, Edit, Maximize
} from 'lucide-react';

const tools = [
    { name: 'Document Converter', href: '/documents/converter', icon: FileText, description: 'Convert between formats' },
    { name: 'PDF Merger', href: '/documents/pdf-merge', icon: FilePlus, description: 'Combine multiple PDFs' },
    { name: 'PDF Splitter', href: '/documents/pdf-split', icon: FileX, description: 'Extract PDF pages' },
    { name: 'PDF Compressor', href: '/documents/pdf-compress', icon: Archive, description: 'Reduce PDF file size' },
    { name: 'PDF Password Protector', href: '/documents/pdf-protect', icon: Lock, description: 'Add password protection' },
    { name: 'PDF Unlocker', href: '/documents/pdf-unlock', icon: Unlock, description: 'Remove PDF password' },
    { name: 'File to Image', href: '/documents/to-image', icon: Image, description: 'Convert pages to images' },
    { name: 'Data Converter', href: '/documents/data-convert', icon: FileJson, description: 'CSV ↔ JSON ↔ XML' },
    { name: 'Metadata Editor', href: '/documents/metadata', icon: Edit, description: 'Edit file metadata' },
    { name: 'File Size Adjuster', href: '/documents/size-adjuster', icon: Maximize, description: 'Resize file capacity' },
];

export default function DocumentsPageClient() {
    return (
        <div className="container" style={{ paddingTop: '40px', paddingBottom: '60px' }}>
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                style={{ textAlign: 'center', marginBottom: '48px' }}
            >
                <h1 style={{ background: 'linear-gradient(135deg, #FFFFFF, #FFFFFF)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text', fontSize: '2rem', fontWeight: 700 }}>Document Tools</h1>
                <p style={{ color: 'var(--text-secondary)', maxWidth: '500px', margin: '0 auto' }}>
                    Convert, merge, split, and manage your documents and PDFs
                </p>
            </motion.div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '16px' }}>
                {tools.map((tool, index) => {
                    const Icon = tool.icon;
                    return (
                        <motion.div
                            key={tool.name}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.03 }}
                        >
                            <Link
                                href={tool.href}
                                className="glass-card glass-card-hover"
                                style={{ display: 'block', padding: '20px', height: '100%' }}
                            >
                                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '16px' }}>
                                    <div style={{
                                        width: '44px',
                                        height: '44px',
                                        borderRadius: '10px',
                                        background: 'rgba(255, 255, 255, 0.05)',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        flexShrink: 0,
                                    }}>
                                        <Icon size={22} color="#FFFFFF" />
                                    </div>
                                    <div style={{ flex: 1 }}>
                                        <span style={{ fontWeight: 600, color: 'var(--text-primary)', display: 'block', marginBottom: '4px' }}>{tool.name}</span>
                                        <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', margin: 0 }}>{tool.description}</p>
                                    </div>
                                </div>
                            </Link>
                        </motion.div>
                    );
                })}
            </div>
        </div>
    );
}
