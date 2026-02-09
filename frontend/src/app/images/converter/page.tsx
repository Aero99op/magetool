import { Metadata } from 'next';
import ImageConverterClient from './client';
import ContentSection from '@/components/ui/ContentSection';
import { toolContent } from '@/data/tool-content';

export const metadata: Metadata = {
    title: 'Image Converter - Convert PNG to JPG, WebP, GIF Free Online',
    description: 'Free online image converter. Convert PNG to JPG, WEBP to PNG, JPEG to GIF and more. Fast, secure, no signup required. Best image format converter tool.',
    keywords: [
        'image converter',
        'png to jpg',
        'jpg to png',
        'convert image',
        'webp to jpg',
        'png to webp',
        'image format converter',
        'online image converter',
        'free image converter',
        'convert png to jpeg',
        'heic to jpg',
    ],
    openGraph: {
        title: 'Free PNG to JPG Converter Online | Magetool',
        description: 'Convert images between PNG, JPG, WEBP, GIF, BMP and more formats instantly. No signup, no limits.',
        url: 'https://magetool.in/images/converter',
        type: 'website',
    },
    twitter: {
        card: 'summary_large_image',
        title: 'Image Converter - PNG to JPG, WebP, GIF',
        description: 'Convert images between all popular formats online for free.',
    },
    alternates: {
        canonical: '/images/converter',
    },
};

// Structured Data for SEO
const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    name: 'Magetool Image Converter',
    applicationCategory: 'MultimediaApplication',
    operatingSystem: 'Web Browser',
    offers: {
        '@type': 'Offer',
        price: '0',
        priceCurrency: 'USD',
    },
    aggregateRating: {
        '@type': 'AggregateRating',
        ratingValue: '4.8',
        ratingCount: '1250',
    },
};

const howToJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'HowTo',
    name: 'How to Convert Image Formats Online',
    description: 'Convert PNG to JPG or any image format online free',
    step: [
        {
            '@type': 'HowToStep',
            name: 'Upload Image',
            text: 'Select or drag and drop your image file (PNG, JPG, WebP, etc.)',
        },
        {
            '@type': 'HowToStep',
            name: 'Choose Format',
            text: 'Select your desired output format from the dropdown menu',
        },
        {
            '@type': 'HowToStep',
            name: 'Convert',
            text: 'Click the Convert button to process your image',
        },
        {
            '@type': 'HowToStep',
            name: 'Download',
            text: 'Download your converted image instantly',
        },
    ],
};

export default function ImageConverterPage() {
    return (
        <>
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
            />
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(howToJsonLd) }}
            />
            <ImageConverterClient />
            <ContentSection {...toolContent['image-converter']} />
        </>
    );
}
