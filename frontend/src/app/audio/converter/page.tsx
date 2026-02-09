import { Metadata } from 'next';
import AudioConverterClient from './client';
import ContentSection from '@/components/ui/ContentSection';
import { toolContent } from '@/data/tool-content';

export const metadata: Metadata = {
    title: 'Audio Converter - MP3, WAV, AAC, FLAC | Magetool',
    description: 'Convert audio files online for free. Support for MP3, WAV, AAC, FLAC, OGG, and M4A. High quality audio conversion with custom bitrate options.',
    keywords: ['audio converter', 'mp3 converter', 'wav converter', 'online audio converter', 'convert to mp3', 'flac to mp3', 'wav to mp3', 'm4a converter'],
    openGraph: {
        title: 'Free Online Audio Converter | Magetool',
        description: 'Convert audio files to MP3, WAV, AAC, and more at high speed.',
        url: 'https://magetool.in/audio/converter',
    },
    alternates: {
        canonical: '/audio/converter',
    },
};

const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    name: 'Magetool Audio Converter',
    applicationCategory: 'MultimediaApplication',
    operatingSystem: 'Web Browser',
    offers: {
        '@type': 'Offer',
        price: '0',
        priceCurrency: 'USD',
    },
};

export default function AudioConverterPage() {
    return (
        <>
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
            />
            <AudioConverterClient />
            <ContentSection {...toolContent['audio-converter']} />
        </>
    );
}
