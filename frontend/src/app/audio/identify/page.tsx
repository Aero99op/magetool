import { Metadata } from 'next';
import SongIdentifierClient from './client';
import ContentSection from '@/components/ui/ContentSection';
import { toolContent } from '@/data/tool-content';

export const metadata: Metadata = {
    title: 'Song Identifier - Identify Songs Online | Magetool',
    description: 'Identify songs online from audio clips. Upload a recording or snippet to find the song title and artist. Free online music recognition tool.',
    keywords: ['song identifier', 'identify song online', 'what song is this', 'music recognition', 'find song by audio', 'audio fingerprinting', 'music id'],
    openGraph: {
        title: 'Free Song Identifier Online - Find Music Title | Magetool',
        description: 'Upload an audio clip to instantly identify the song title and artist.',
        url: 'https://magetool.in/audio/identify',
    },
    alternates: {
        canonical: '/audio/identify',
    },
};

const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    name: 'Magetool Song Identifier',
    applicationCategory: 'MultimediaApplication',
    operatingSystem: 'Web Browser',
    offers: {
        '@type': 'Offer',
        price: '0',
        priceCurrency: 'USD',
    },
};

export default function SongIdentifierPage() {
    return (
        <>
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
            />
            <SongIdentifierClient />
            <ContentSection {...toolContent['audio-identify']} />
        </>
    );
}
