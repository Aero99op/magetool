import { Metadata } from 'next';
import AIVideoFinderClient from './client';

export const metadata: Metadata = {
    title: 'AI Video Finder - Reverse Video Search | Magetool',
    description: 'Find original video source using AI. Reverse search video clips to find the creator, similar videos, or verify authenticity. Free AI video analysis.',
    keywords: ['reverse video search', 'video finder', 'find video source', 'ai video search', 'video recognizer', 'source finder', 'video verification'],
    openGraph: {
        title: 'Free AI Video Finder - Reverse Search Tools | Magetool',
        description: 'Locate the original source of any video using visual AI analysis.',
        url: 'https://magetool.in/videos/ai-finder',
    },
    alternates: {
        canonical: '/videos/ai-finder',
    },
};

const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    name: 'Magetool AI Video Finder',
    applicationCategory: 'MultimediaApplication',
    operatingSystem: 'Web Browser',
    offers: {
        '@type': 'Offer',
        price: '0',
        priceCurrency: 'USD',
    },
};

export default function AIVideoFinderPage() {
    return (
        <>
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
            />
            <AIVideoFinderClient />
        </>
    );
}
