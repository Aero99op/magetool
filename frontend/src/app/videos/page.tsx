import type { Metadata } from 'next';
import VideosPageClient from './client';

export const metadata: Metadata = {
    title: 'Free Online Video Tools - Convert, Edit, Compress - Magetool',
    description: 'Magetool Video Tools: Free online video converter, compressor, trimmer, and editor. Support for MP4, AVI, MKV, MOV and more. No watermarks.',
    keywords: ['video tools', 'online video editor', 'video converter', 'compress video', 'trim video', 'magetool video', 'free video tools'],
    openGraph: {
        title: 'Magetool Video Studio - Free Online Video Tools',
        description: 'Edit, convert, and compress videos online for free. Fast, secure, and no installation required.',
    },
};

export default function VideosPage() {
    return <VideosPageClient />;
}
