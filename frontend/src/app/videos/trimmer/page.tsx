import { Metadata } from 'next';
import VideoTrimmerClient from './client';
import ContentSection from '@/components/ui/ContentSection';
import { toolContent } from '@/data/tool-content';

export const metadata: Metadata = {
    title: 'Video Trimmer - Cut Video Online | Magetool',
    description: 'Trim and cut videos online. Remove unwanted parts, shorten clips, and edit video length easily. Supports MP4, AVI, MKV and more.',
    keywords: ['video trimmer', 'cut video online', 'trim mp4', 'video cutter', 'shorten video', 'crop video length', 'online video editor'],
    openGraph: {
        title: 'Free Video Trimmer - Cut Clips Online | Magetool',
        description: 'Cut video clips precisely. Remove intros and outros instantly.',
        url: 'https://magetool.in/videos/trimmer',
    },
    alternates: {
        canonical: '/videos/trimmer',
    },
};

const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    name: 'Magetool Video Trimmer',
    applicationCategory: 'MultimediaApplication',
    operatingSystem: 'Web Browser',
    offers: {
        '@type': 'Offer',
        price: '0',
        priceCurrency: 'USD',
    },
};

export default function VideoTrimmerPage() {
    return (
        <>
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
            />
            <VideoTrimmerClient />
            <ContentSection {...toolContent['video-trimmer']} />
        </>
    );
}
