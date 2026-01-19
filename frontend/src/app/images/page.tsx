import type { Metadata } from 'next';
import ImagesPageClient from './client';

export const metadata: Metadata = {
    title: 'Free Online Image Tools - Converter, Resizer, Background Remover - Magetool',
    description: 'Magetool Image Suite: Free online photo editor. Convert JPG/PNG/WebP, remove backgrounds, resize images, and crop photos with AI technology.',
    keywords: ['image tools', 'online photo editor', 'image converter', 'background remover', 'resize image', 'magetool images', 'free photo tools'],
    openGraph: {
        title: 'Magetool Image Studio - Free Online Photo Tools',
        description: 'Edit, convert, and enhance photos online for free. AI Background remover, upscaler, and more.',
    },
};

export default function ImagesPage() {
    return <ImagesPageClient />;
}
