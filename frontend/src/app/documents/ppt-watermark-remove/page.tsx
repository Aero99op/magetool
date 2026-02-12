import { Metadata } from 'next';
import PPTWatermarkRemoveClient from './client';
import ContentSection from '@/components/ui/ContentSection';
import { toolContent } from '@/data/tool-content';

export const metadata: Metadata = {
    title: 'PPT Watermark Remover - Remove Watermarks from PowerPoint | Magetool',
    description: 'Remove watermarks from PowerPoint presentations for free. Detects and removes DRAFT, CONFIDENTIAL overlays, template watermarks, and semi-transparent stamps from PPTX files.',
    keywords: ['remove watermark ppt', 'pptx watermark remover', 'powerpoint watermark remove', 'remove draft watermark', 'ppt watermark cleaner', 'free ppt watermark remover'],
    openGraph: {
        title: 'Free PPT Watermark Remover Online | Magetool',
        description: 'Remove watermarks from PowerPoint presentations instantly. Free, no signup.',
        url: 'https://magetool.in/documents/ppt-watermark-remove',
    },
    alternates: {
        canonical: '/documents/ppt-watermark-remove',
    },
};

const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    name: 'Magetool PPT Watermark Remover',
    applicationCategory: 'MultimediaApplication',
    operatingSystem: 'Web Browser',
    offers: {
        '@type': 'Offer',
        price: '0',
        priceCurrency: 'USD',
    },
};

export default function PPTWatermarkRemovePage() {
    return (
        <>
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
            />
            <PPTWatermarkRemoveClient />
        </>
    );
}
