import { Metadata } from 'next';
import PassportPhotoClient from './client';

export const metadata: Metadata = {
    title: 'Passport Photo Maker - Create ID Photos Online | Magetool',
    description: 'Create professional passport size photos online. Supports US (2x2 inch), EU (35x45mm) and other standard sizes. Change background color and download for printing.',
    keywords: ['passport photo maker', 'id photo generator', 'visa photo creator', '2x2 photo', 'passport size photo', 'online passport photo', 'background remover'],
    openGraph: {
        title: 'Free Passport Photo Maker - Create ID Photos Online | Magetool',
        description: 'Make official passport and Visa photos in seconds. Standard sizes and background removal included.',
        url: 'https://magetool.in/images/passport-photo',
    },
    alternates: {
        canonical: '/images/passport-photo',
    },
};

const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    name: 'Magetool Passport Photo Maker',
    applicationCategory: 'PhotographyApplication',
    operatingSystem: 'Web Browser',
    offers: {
        '@type': 'Offer',
        price: '0',
        priceCurrency: 'USD',
    },
};

export default function PassportPhotoPage() {
    return (
        <>
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
            />
            <PassportPhotoClient />
        </>
    );
}
