import { Metadata } from 'next';
import WatermarkRemoveClient from './client';
import ContentSection from '@/components/ui/ContentSection';
import { toolContent } from '@/data/tool-content';

export const metadata: Metadata = {
    title: 'AI Watermark Remover - Remove Text from Images | Magetool',
    description: 'Remove watermarks, logos, dates, and text overlays from images using AI. Free online inpainting tool that cleans your photos automatically.',
    keywords: ['watermark remover', 'remove watermark online', 'ai watermark remover', 'remove text from image', 'clonestamp online', 'photo cleaner', 'inpainting tool'],
    openGraph: {
        title: 'Free AI Watermark Remover - Clean Photos Online | Magetool',
        description: 'Remove unwanted watermarks and objects from your photos perfectly using AI.',
        url: 'https://magetool.in/images/watermark-remove',
    },
    alternates: {
        canonical: '/images/watermark-remove',
    },
};

const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    name: 'Magetool Watermark Remover',
    applicationCategory: 'MultimediaApplication',
    operatingSystem: 'Web Browser',
    offers: {
        '@type': 'Offer',
        price: '0',
        priceCurrency: 'USD',
    },
};

export default function WatermarkRemovePage() {
    return (
        <>
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
            />
            <WatermarkRemoveClient />
            <ContentSection {...toolContent['image-watermark-remove']} />
        </>
    );
}
