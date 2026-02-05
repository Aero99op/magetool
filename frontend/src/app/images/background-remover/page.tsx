import { Metadata } from 'next';
import BackgroundRemoverClient from './client';

export const metadata: Metadata = {
    title: 'Remove Background - AI Background Remover Free Online | Magetool',
    description: 'Free AI background remover. Remove background from images instantly. Perfect for product photos, portraits, logos. No signup required.',
    keywords: [
        'remove background',
        'background remover',
        'remove bg',
        'transparent background',
        'remove image background',
        'background eraser',
        'photo background remover',
        'ai background remover',
        'free background remover',
        'remove white background',
    ],
    openGraph: {
        title: 'Free AI Background Remover Online | Magetool',
        description: 'Remove image backgrounds instantly with AI. Get transparent PNG for free.',
        url: 'https://magetool.in/images/background-remover',
        type: 'website',
    },
    twitter: {
        card: 'summary_large_image',
        title: 'AI Background Remover - Remove BG Free',
        description: 'Remove backgrounds from photos instantly with AI.',
    },
    alternates: {
        canonical: '/images/background-remover',
    },
};

const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    name: 'Magetool Background Remover',
    applicationCategory: 'MultimediaApplication',
    operatingSystem: 'Web Browser',
    offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
    aggregateRating: { '@type': 'AggregateRating', ratingValue: '4.9', ratingCount: '3100' },
};

const howToJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'HowTo',
    name: 'How to Remove Background from Image',
    step: [
        { '@type': 'HowToStep', text: 'Upload your image (JPG, PNG, WebP)' },
        { '@type': 'HowToStep', text: 'AI automatically detects subject' },
        { '@type': 'HowToStep', text: 'Download transparent PNG' },
    ],
};

export default function BackgroundRemoverPage() {
    return (
        <>
            <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
            <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(howToJsonLd) }} />
            <BackgroundRemoverClient />
        </>
    );
}
