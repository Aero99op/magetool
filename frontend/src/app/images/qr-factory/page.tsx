import { Metadata } from 'next';
import QRFactoryClient from './client';

export const metadata: Metadata = {
    title: 'QR Code Generator - Create Free Custom QR Codes | Magetool',
    description: 'Free online QR code generator. Create QR codes for URLs, WiFi, Contacts (vCard) and more. Customize colors, adding logos. High resolution download.',
    keywords: ['qr code generator', 'create qr code', 'free qr code', 'wifi qr code', 'custom qr code', 'qr code maker', 'vcard qr code'],
    openGraph: {
        title: 'Free QR Code Generator Online | Magetool',
        description: 'Create beautiful, custom QR codes for URLs, WiFi, and more.',
        url: 'https://magetool.in/images/qr-factory',
    },
    alternates: {
        canonical: '/images/qr-factory',
    },
};

const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    name: 'Magetool QR Factory',
    applicationCategory: 'GeneratorApplication',
    operatingSystem: 'Web Browser',
    offers: {
        '@type': 'Offer',
        price: '0',
        priceCurrency: 'USD',
    },
};

export default function QRFactoryPage() {
    return (
        <>
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
            />
            <QRFactoryClient />
        </>
    );
}
