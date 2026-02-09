import { Metadata } from 'next';
import VideoCompressorClient from './client';
import ContentSection from '@/components/ui/ContentSection';
import { toolContent } from '@/data/tool-content';

export const metadata: Metadata = {
    title: 'Video Compressor - Reduce Video Size Online | Magetool',
    description: 'Compress video files online without losing quality. Reduce MP4, AVI, MKV size for WhatsApp, Email, or Web. Free fast video compression tool.',
    keywords: ['video compressor', 'compress mp4', 'reduce video size', 'compress video online', 'video shrinker', 'minimize video size', 'whatsapp video compressor'],
    openGraph: {
        title: 'Free Video Compressor - Reduce File Size Online | Magetool',
        description: 'Compress videos efficiently. Reduce file size by up to 90% while maintaining quality.',
        url: 'https://magetool.in/videos/compressor',
    },
    alternates: {
        canonical: '/videos/compressor',
    },
};

const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    name: 'Magetool Video Compressor',
    applicationCategory: 'MultimediaApplication',
    operatingSystem: 'Web Browser',
    offers: {
        '@type': 'Offer',
        price: '0',
        priceCurrency: 'USD',
    },
};

export default function VideoCompressorPage() {
    return (
        <>
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
            />
            <VideoCompressorClient />
            <ContentSection {...toolContent['video-compressor']} />
        </>
    );
}
