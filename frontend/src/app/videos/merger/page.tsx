import { Metadata } from 'next';
import VideoMergerClient from './client';

export const metadata: Metadata = {
    title: 'Video Merger - Combine Videos Online | Magetool',
    description: 'Merge multiple video files into one. Join MP4, AVI, MKV clips seamlessly. fast and free video joiner tool.',
    keywords: ['video merger', 'join videos', 'combine videos', 'video joiner online', 'merge mp4', 'stitch videos', 'video concatenation'],
    openGraph: {
        title: 'Free Video Merger - Join Clips Online | Magetool',
        description: 'Combine multiple videos into one seamless file instantly.',
        url: 'https://magetool.in/videos/merger',
    },
    alternates: {
        canonical: '/videos/merger',
    },
};

const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    name: 'Magetool Video Merger',
    applicationCategory: 'MultimediaApplication',
    operatingSystem: 'Web Browser',
    offers: {
        '@type': 'Offer',
        price: '0',
        priceCurrency: 'USD',
    },
};

export default function VideoMergerPage() {
    return (
        <>
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
            />
            <VideoMergerClient />
        </>
    );
}
