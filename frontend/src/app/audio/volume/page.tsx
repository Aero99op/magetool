import { Metadata } from 'next';
import VolumeBoosterClient from './client';

export const metadata: Metadata = {
    title: 'Volume Booster - Increase MP3 Volume Online | Magetool',
    description: 'Boost MP3 volume online for free. Increase audio volume up to 200%. Fix low volume recordings with our online audio amplifier.',
    keywords: ['volume booster', 'audio booster', 'increase mp3 volume', 'make audio louder', 'sound booster online', 'mp3 volume increaser', 'audio normalizer'],
    openGraph: {
        title: 'Free Audio Volume Booster & Normalizer | Magetool',
        description: 'Increase audio volume and normalize sound levels online.',
        url: 'https://magetool.in/audio/volume',
    },
    alternates: {
        canonical: '/audio/volume',
    },
};

const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    name: 'Magetool Volume Booster',
    applicationCategory: 'MultimediaApplication',
    operatingSystem: 'Web Browser',
    offers: {
        '@type': 'Offer',
        price: '0',
        priceCurrency: 'USD',
    },
};

export default function VolumeBoosterPage() {
    return (
        <>
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
            />
            <VolumeBoosterClient />
        </>
    );
}
