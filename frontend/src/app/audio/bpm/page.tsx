import { Metadata } from 'next';
import BPMDetectorClient from './client';
import ContentSection from '@/components/ui/ContentSection';
import { toolContent } from '@/data/tool-content';

export const metadata: Metadata = {
    title: 'BPM Detector - Song Tempo Finder | Magetool',
    description: 'Detect BPM (Beats Per Minute) of any song online. Find tempo of MP3, WAV files. Perfect for DJs, producers, and dancers. Accurate and free.',
    keywords: ['bpm detector', 'song key finder', 'find bpm', 'tempo tapper', 'music speed detector', 'beats per minute calculator', 'bpm counter'],
    openGraph: {
        title: 'Free BPM Detector - Find Song Tempo Online | Magetool',
        description: 'Instantly find the BPM (tempo) of any song with our advanced audio analysis tool.',
        url: 'https://magetool.in/audio/bpm',
    },
    alternates: {
        canonical: '/audio/bpm',
    },
};

const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    name: 'Magetool BPM Finder',
    applicationCategory: 'MultimediaApplication',
    operatingSystem: 'Web Browser',
    offers: {
        '@type': 'Offer',
        price: '0',
        priceCurrency: 'USD',
    },
};

export default function BPMDetectorPage() {
    return (
        <>
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
            />
            <BPMDetectorClient />
            <ContentSection {...toolContent['audio-bpm']} />
        </>
    );
}
