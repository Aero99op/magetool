import { Metadata } from 'next';
import AudioTrimmerClient from './client';

export const metadata: Metadata = {
    title: 'Audio Trimmer - Cut MP3 Online | Magetool',
    description: 'Trim audio files online for free. Cut MP3, WAV, M4A song parts. Create ringtones, remove silence, add fade in/out effects. Fast and secure.',
    keywords: ['audio trimmer', 'cut mp3', 'audio cutter', 'trim audio online', 'make ringtone', 'mp3 cutter', 'cut music'],
    openGraph: {
        title: 'Free Audio Trimmer & Cutter | Magetool',
        description: 'Easily cut and trim audio files with fade effects to create ringtones or clips.',
        url: 'https://magetool.in/audio/trimmer',
    },
    alternates: {
        canonical: '/audio/trimmer',
    },
};

const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    name: 'Magetool Audio Trimmer',
    applicationCategory: 'MultimediaApplication',
    operatingSystem: 'Web Browser',
    offers: {
        '@type': 'Offer',
        price: '0',
        priceCurrency: 'USD',
    },
};

export default function AudioTrimmerPage() {
    return (
        <>
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
            />
            <AudioTrimmerClient />
        </>
    );
}
