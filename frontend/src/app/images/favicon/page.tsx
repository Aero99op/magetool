import { Metadata } from 'next';
import FaviconGeneratorClient from './client';

export const metadata: Metadata = {
    title: 'Favicon Generator - Create Icons from Image | Magetool',
    description: 'Create favicons for your website from any image. Generates standard 16x16, 32x32 ICO files and modern PNG icons for Android and iOS.',
    keywords: ['favicon generator', 'create favicon', 'image to ico', 'website icon generator', 'png to ico', 'favicon converter', 'app icon generator'],
    openGraph: {
        title: 'Free Favicon Generator Online - Image to ICO | Magetool',
        description: 'Generate high-quality favicons (ICO & PNG) for your website in seconds.',
        url: 'https://magetool.in/images/favicon',
    },
    alternates: {
        canonical: '/images/favicon',
    },
};

const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    name: 'Magetool Favicon Generator',
    applicationCategory: 'DesignApplication',
    operatingSystem: 'Web Browser',
    offers: {
        '@type': 'Offer',
        price: '0',
        priceCurrency: 'USD',
    },
};

export default function FaviconGeneratorPage() {
    return (
        <>
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
            />
            <FaviconGeneratorClient />
        </>
    );
}
