import { Metadata } from 'next';
import VideoRotateClient from './client';
import ContentSection from '@/components/ui/ContentSection';
import { toolContent } from '@/data/tool-content';

export const metadata: Metadata = {
    title: 'Video Rotator - Rotate MP4 Video Online | Magetool',
    description: 'Rotate video 90, 180, 270 degrees online. Flip video horizontal or vertical. Fix sideways video orientation free.',
    keywords: ['rotate video', 'flip video', 'rotate mp4', 'fix sideways video', 'mirror video', 'video orientation', 'rotate video online'],
    openGraph: {
        title: 'Free Video Rotator - Fix Orientation | Magetool',
        description: 'Rotate and flip videos instantly. Correct sideways recordings online.',
        url: 'https://magetool.in/videos/rotate',
    },
    alternates: {
        canonical: '/videos/rotate',
    },
};

const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    name: 'Magetool Video Rotator',
    applicationCategory: 'MultimediaApplication',
    operatingSystem: 'Web Browser',
    offers: {
        '@type': 'Offer',
        price: '0',
        priceCurrency: 'USD',
    },
};

export default function VideoRotatePage() {
    return (
        <>
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
            />
            <VideoRotateClient />
            <ContentSection {...toolContent['video-rotate']} />
        </>
    );
}
