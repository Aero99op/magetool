import type { Metadata } from 'next';
import ImageEditorClient from './client';

export const metadata: Metadata = {
    title: 'Advanced Photo Editor & Collage Maker - Magetool',
    description: 'Free online professional photo editor. Adjust brightness, contrast, crop images, and create beautiful collages with 30+ layouts. Zero-upload, secure, and fast.',
    keywords: ['online photo editor', 'collage maker', 'image editor', 'passport photo maker', 'free image tools', 'photo filter'],
};

export default function ImageEditorPage() {
    return <ImageEditorClient />;
}
