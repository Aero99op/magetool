import { Metadata } from 'next';
import VideoSpeedClient from './client';
import ContentSection from '@/components/ui/ContentSection';
import { toolContent } from '@/data/tool-content';

export const metadata: Metadata = {
    title: 'Video Speed Changer - Slow Motion & Fast Forward | Magetool',
    description: 'Change video speed online. Create slow motion or fast forward videos. Adjust video playback speed from 0.25x to 4x. Free video speed editor.',
    keywords: ['video speed changer', 'slow motion video', 'fast forward video', 'video speed editor', 'change mp4 speed', 'time lapse maker', 'speed up video'],
    openGraph: {
        title: 'Free Video Speed Changer - Slow Mo & Fast Fwd | Magetool',
        description: 'Speed up or slow down your videos instantly. Create dramatic effects.',
        url: 'https://magetool.in/videos/speed',
    },
    alternates: {
        canonical: '/videos/speed',
    },
};

const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    name: 'Magetool Video Speed Changer',
    applicationCategory: 'MultimediaApplication',
    operatingSystem: 'Web Browser',
    offers: {
        '@type': 'Offer',
        price: '0',
        priceCurrency: 'USD',
    },
};

export default function VideoSpeedPage() {
    return (
        <>
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
            />
            <VideoSpeedClient />
            <ContentSection {...toolContent['video-speed']} />
        </>
    );
}
