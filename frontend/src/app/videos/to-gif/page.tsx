import { Metadata } from 'next';
import VideoToGifClient from './client';

export const metadata: Metadata = {
    title: 'Video to GIF Converter - Create Animated GIFs | Magetool',
    description: 'Convert video to GIF online. Make animated GIFs from MP4, AVI, MKV. Customize FPS, resolution and trim video. Free video to gif maker.',
    keywords: ['video to gif', 'make gif from video', 'convert mp4 to gif', 'gif maker online', 'create animated gif', 'video to animation'],
    openGraph: {
        title: 'Free Video to GIF Maker - Convert Clips Online | Magetool',
        description: 'Turn your videos into high-quality GIFs in seconds. Customize FPS and size.',
        url: 'https://magetool.in/videos/to-gif',
    },
    alternates: {
        canonical: '/videos/to-gif',
    },
};

const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    name: 'Magetool Video to GIF',
    applicationCategory: 'MultimediaApplication',
    operatingSystem: 'Web Browser',
    offers: {
        '@type': 'Offer',
        price: '0',
        priceCurrency: 'USD',
    },
};

export default function VideoToGifPage() {
    return (
        <>
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
            />
            <VideoToGifClient />
        </>
    );
}
