import { Metadata } from 'next';
import ExtractAudioClient from './client';

export const metadata: Metadata = {
    title: 'Extract Audio from Video - Video to MP3 | Magetool',
    description: 'Extract audio from video online. Convert MP4 to MP3, WAV, AAC. High quality audio extraction from video files. Free and fast conversion.',
    keywords: ['extract audio', 'video to mp3', 'video to audio', 'convert video to sound', 'mp4 to mp3', 'extract sound from video', 'audio ripper'],
    openGraph: {
        title: 'Free Audio Extractor - Video to MP3 | Magetool',
        description: 'Extract high-quality audio from your videos. Supports MP3, WAV, and more.',
        url: 'https://magetool.in/videos/extract-audio',
    },
    alternates: {
        canonical: '/videos/extract-audio',
    },
};

const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    name: 'Magetool Audio Extractor',
    applicationCategory: 'MultimediaApplication',
    operatingSystem: 'Web Browser',
    offers: {
        '@type': 'Offer',
        price: '0',
        priceCurrency: 'USD',
    },
};

export default function ExtractAudioPage() {
    return (
        <>
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
            />
            <ExtractAudioClient />
        </>
    );
}
