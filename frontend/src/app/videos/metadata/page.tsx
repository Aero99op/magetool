import { Metadata } from 'next';
import VideoMetadataClient from './client';

export const metadata: Metadata = {
    title: 'Video Metadata Viewer - Check Video Details | Magetool',
    description: 'View detailed video metadata online. Check resolution, bitrate, codec, frame rate, and audio properties. Free video analysis tool.',
    keywords: ['video metadata', 'check video resolution', 'video bitrate viewer', 'video codec checker', 'media info online', 'mp4 metadata reader'],
    openGraph: {
        title: 'Free Video Metadata Viewer - details Online | Magetool',
        description: 'See detailed technical info about your videos. Check codecs, resolution, and more.',
        url: 'https://magetool.in/videos/metadata',
    },
    alternates: {
        canonical: '/videos/metadata',
    },
};

const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    name: 'Magetool Video Metadata Viewer',
    applicationCategory: 'MultimediaApplication',
    operatingSystem: 'Web Browser',
    offers: {
        '@type': 'Offer',
        price: '0',
        priceCurrency: 'USD',
    },
};

export default function VideoMetadataPage() {
    return (
        <>
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
            />
            <VideoMetadataClient />
        </>
    );
}
