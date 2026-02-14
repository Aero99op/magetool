'use client';

import Link from 'next/link';
import {
    FileText, FilePlus, FileX, Archive, Lock,
    Unlock, Image, FileJson, Edit, Maximize, Shield, Droplets, Workflow
} from 'lucide-react';
import SectionWrapper from '@/components/ui/SectionWrapper';
import PremiumCard from '@/components/ui/PremiumCard';

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
    { name: 'Hash Verifier', href: '/documents/hash-verifier', icon: Shield, description: 'Verify file integrity (SHA256)' },
    { name: 'PPT Watermark Remover', href: '/documents/ppt-watermark-remove', icon: Droplets, description: 'Remove watermarks from PPT' },
    { name: 'Structure Visualizer', href: '/documents/structure-visualizer', icon: Workflow, description: 'Text to Tree/Graph Diagrams' },
];

export default function DocumentsPageClient() {
    return (
        <SectionWrapper className="container" style={{ paddingTop: '100px', paddingBottom: '80px' }}>
            <div style={{ textAlign: 'center', marginBottom: '60px' }}>
                <h1 className="tool-title" style={{
                    backgroundImage: 'linear-gradient(135deg, #FFF, var(--text-secondary))'
                }}>
                    Document Center
                </h1>
                <p style={{ fontSize: '1.2rem', color: 'var(--text-secondary)', maxWidth: '600px', margin: '0 auto' }}>
                    Securely manage your PDFs and documents.
                    Merge, split, and convert without uploading to a server.
                </p>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '24px' }}>
                {tools.map((tool, index) => {
                    const Icon = tool.icon;
                    return (
                        <Link key={tool.href} href={tool.href} style={{ textDecoration: 'none' }}>
                            <PremiumCard
                                delay={index * 0.05}
                                style={{ height: '100%' }}
                            >
                                <div style={{ padding: '24px', display: 'flex', alignItems: 'flex-start', gap: '20px' }}>
                                    <div style={{
                                        width: '56px',
                                        height: '56px',
                                        borderRadius: '16px',
                                        background: 'var(--bg-elevated)',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        flexShrink: 0,
                                        border: '1px solid var(--glass-border)',
                                        color: 'var(--text-primary)'
                                    }}>
                                        <Icon size={28} />
                                    </div>
                                    <div>
                                        <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '8px', color: 'var(--text-primary)' }}>{tool.name}</h3>
                                        <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                                            {tool.description}
                                        </p>
                                    </div>
                                </div>
                            </PremiumCard>
                        </Link>
                    );
                })}
            </div>
        </SectionWrapper>
    );
}
