import { Metadata } from 'next';
import BlurFaceClient from './client';

export const metadata: Metadata = {
    title: 'Blur Face & License Plates - Anonymize Photos | Magetool',
    description: 'Blur faces, license plates, or sensitive info in photos online. Adjustable blur intensity for privacy protection. Free, secure, and easy to use.',
    keywords: ['blur face', 'blur image', 'anonymize photo', 'blur license plate', 'hide face online', 'image blur tool', 'privacy tool'],
    openGraph: {
        title: 'Free Image Blur Tool - Protect Privacy | Magetool',
        description: 'Easily blur faces, license plates, and sensitive details in your photos.',
        url: 'https://magetool.in/images/blur-face',
    },
    alternates: {
        canonical: '/images/blur-face',
    },
};

const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    name: 'Magetool Face Blur',
    applicationCategory: 'MultimediaApplication',
    operatingSystem: 'Web Browser',
    offers: {
        '@type': 'Offer',
        price: '0',
        priceCurrency: 'USD',
    },
};

export default function BlurFacePage() {
    return (
        <>
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
            />
            <BlurFaceClient />
        </>
    );
}
