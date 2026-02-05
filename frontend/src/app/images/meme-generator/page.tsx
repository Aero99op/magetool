import { Metadata } from 'next';
import MemeGeneratorClient from './client';

export const metadata: Metadata = {
    title: 'Meme Generator - Create Custom Memes Online | Magetool',
    description: 'Create viral memes with our free online meme generator. Upload your own images, add draggable text, custom fonts, and colors to make the perfect meme.',
    keywords: ['meme generator', 'create memes', 'meme maker', 'add text to image', 'funny meme creator', 'free meme tool', 'caption image'],
    openGraph: {
        title: 'Free Meme Generator - Create Viral Memes | Magetool',
        description: 'Make custom memes instantly. Upload images, add text, and share your creations.',
        url: 'https://magetool.in/images/meme-generator',
    },
    alternates: {
        canonical: '/images/meme-generator',
    },
};

const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    name: 'Magetool Meme Generator',
    applicationCategory: 'MultimediaApplication',
    operatingSystem: 'Web Browser',
    offers: {
        '@type': 'Offer',
        price: '0',
        priceCurrency: 'USD',
    },
};

export default function MemeGeneratorPage() {
    return (
        <>
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
            />
            <MemeGeneratorClient />
        </>
    );
}
