import { Metadata } from 'next';
import AIUpscalerClient from './client';
import ContentSection from '@/components/ui/ContentSection';
import { toolContent } from '@/data/tool-content';

export const metadata: Metadata = {
    title: 'AI Image Upscaler - Enhance Photos Free Online | Magetool',
    description: 'Free AI image upscaler. Enhance low-resolution photos up to 8x. AI-powered image enhancement. Sharpen blurry images. No signup required.',
    keywords: ['image upscaler', 'ai upscaler', 'upscale image', 'enhance photo', 'increase resolution', 'ai image enhancer', 'sharpen image', 'free upscaler'],
    openGraph: { title: 'Free AI Image Upscaler Online | Magetool', description: 'Enhance and upscale images up to 8x with AI.', url: 'https://magetool.in/images/upscaler' },
    alternates: { canonical: '/images/upscaler' },
};

const jsonLd = { '@context': 'https://schema.org', '@type': 'SoftwareApplication', name: 'Magetool AI Upscaler', applicationCategory: 'MultimediaApplication', operatingSystem: 'Web Browser', offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' } };

export default function AIUpscalerPage() {
    return (
        <>
            <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
            <AIUpscalerClient />
            <ContentSection {...toolContent['image-upscaler']} />
        </>
    );
}
