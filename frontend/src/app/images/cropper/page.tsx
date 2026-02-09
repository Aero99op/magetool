import { Metadata } from 'next';
import ImageCropperClient from './client';
import ContentSection from '@/components/ui/ContentSection';
import { toolContent } from '@/data/tool-content';

export const metadata: Metadata = {
    title: 'Image Cropper - Crop Photos Free Online | Magetool',
    description: 'Free online image cropper. Crop photos with preset aspect ratios for Instagram, YouTube, Facebook. Precise pixel control. No signup required.',
    keywords: ['image cropper', 'crop image', 'crop photo', 'photo cropper', 'crop picture online', 'free image cropper', 'aspect ratio cropper'],
    openGraph: { title: 'Free Image Cropper Online | Magetool', description: 'Crop images with preset ratios instantly.', url: 'https://magetool.in/images/cropper' },
    alternates: { canonical: '/images/cropper' },
};

const jsonLd = { '@context': 'https://schema.org', '@type': 'SoftwareApplication', name: 'Magetool Image Cropper', applicationCategory: 'MultimediaApplication', operatingSystem: 'Web Browser', offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' } };

export default function ImageCropperPage() {
    return (
        <>
            <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
            <ImageCropperClient />
            <ContentSection {...toolContent['image-cropper']} />
        </>
    );
}
