import { Metadata } from 'next';
import ImageResizerClient from './client';
import ContentSection from '@/components/ui/ContentSection';
import { toolContent } from '@/data/tool-content';

export const metadata: Metadata = {
    title: 'Image Resizer - Resize Images Free Online | Magetool',
    description: 'Free online image resizer. Resize photos to exact dimensions in pixels. Maintain aspect ratio. Fast, secure, no signup required.',
    keywords: ['image resizer', 'resize image', 'resize photo', 'change image size', 'resize picture online', 'free image resizer', 'photo resizer'],
    openGraph: { title: 'Free Image Resizer Online | Magetool', description: 'Resize images to exact pixel dimensions instantly.', url: 'https://magetool.in/images/resizer' },
    alternates: { canonical: '/images/resizer' },
};

const jsonLd = { '@context': 'https://schema.org', '@type': 'SoftwareApplication', name: 'Magetool Image Resizer', applicationCategory: 'MultimediaApplication', operatingSystem: 'Web Browser', offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' } };

export default function ImageResizerPage() {
    return (
        <>
            <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
            <ImageResizerClient />
            <ContentSection {...toolContent['image-resizer']} />
        </>
    );
}
