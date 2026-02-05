import { Metadata } from 'next';
import ExifScrubberClient from './client';

export const metadata: Metadata = {
    title: 'EXIF Data Remover - Strip Metadata from Photos | Magetool',
    description: 'Remove EXIF metadata, GPS location, and camera details from photos online. Protect your privacy before sharing images. Free and secure tool.',
    keywords: ['exif remover', 'remove metadata', 'strip exif data', 'remove gps from photo', 'clean image metadata', 'privacy tool', 'metadata scrubber'],
    openGraph: {
        title: 'Free EXIF Metadata Remover - Clean Photo Data | Magetool',
        description: 'Protect your privacy by stripping hidden EXIF metadata and GPS location from your photos.',
        url: 'https://magetool.in/images/exif-scrubber',
    },
    alternates: {
        canonical: '/images/exif-scrubber',
    },
};

const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    name: 'Magetool EXIF Scrubber',
    applicationCategory: 'SecurityApplication',
    operatingSystem: 'Web Browser',
    offers: {
        '@type': 'Offer',
        price: '0',
        priceCurrency: 'USD',
    },
};

export default function ExifScrubberPage() {
    return (
        <>
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
            />
            <ExifScrubberClient />
        </>
    );
}
