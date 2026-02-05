import { Metadata } from 'next';
import WatermarkAddClient from './client';

export const metadata: Metadata = {
    title: 'Add Watermark to Images - Protect Your Photos | Magetool',
    description: 'Add text watermarks to your images online. Protect your copyright and intellectual property. Customize text, position, and transparency.',
    keywords: ['add watermark', 'watermark photos', 'image copyright', 'protect images', 'photo branding', 'text on image', 'online watermark tool'],
    openGraph: {
        title: 'Free Watermark Creator - Add Text to Photos | Magetool',
        description: 'Protect your images with custom text watermarks. Fast, free, and secure.',
        url: 'https://magetool.in/images/watermark-add',
    },
    alternates: {
        canonical: '/images/watermark-add',
    },
};

const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    name: 'Magetool Watermark Creator',
    applicationCategory: 'MultimediaApplication',
    operatingSystem: 'Web Browser',
    offers: {
        '@type': 'Offer',
        price: '0',
        priceCurrency: 'USD',
    },
};

export default function WatermarkAddPage() {
    return (
        <>
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
            />
            <WatermarkAddClient />
        </>
    );
}
