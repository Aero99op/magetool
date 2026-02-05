import { Metadata } from 'next';
import VideoToFramesClient from './client';

export const metadata: Metadata = {
    title: 'Video to Frames - Extract Images from Video | Magetool',
    description: 'Extract frames from video online. Convert video to images (JPG/PNG). Get every frame or specific FPS. Download all screenshots as ZIP.',
    keywords: ['video to frames', 'extract images from video', 'video to jpg', 'video to png', 'screenshot extractor', 'frame extractor', 'video sequence'],
    openGraph: {
        title: 'Free Video to Frames Extractor - Save Video Images | Magetool',
        description: 'Extract high-quality images from any video. Choose your frame rate and format.',
        url: 'https://magetool.in/videos/to-frames',
    },
    alternates: {
        canonical: '/videos/to-frames',
    },
};

const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    name: 'Magetool Video to Frames',
    applicationCategory: 'MultimediaApplication',
    operatingSystem: 'Web Browser',
    offers: {
        '@type': 'Offer',
        price: '0',
        priceCurrency: 'USD',
    },
};

export default function VideoToFramesPage() {
    return (
        <>
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
            />
            <VideoToFramesClient />
        </>
    );
}
