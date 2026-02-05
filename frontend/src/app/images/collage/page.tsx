import { Metadata } from 'next';
import CollageMakerClient from './client';

export const metadata: Metadata = {
    title: 'Photo Collage Maker - Create Collages Free Online | Magetool',
    description: 'Free online photo collage maker. Combine multiple photos into beautiful collages with custom layouts. 2x2, 3x3, strips and more. No signup required.',
    keywords: ['photo collage', 'collage maker', 'photo grid', 'combine photos', 'picture collage', 'free collage maker', 'photo combiner', 'image collage online'],
    openGraph: {
        title: 'Free Photo Collage Maker Online | Magetool',
        description: 'Create beautiful photo collages with custom layouts instantly.',
        url: 'https://magetool.in/images/collage',
    },
    alternates: { canonical: '/images/collage' },
};

const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    name: 'Magetool Collage Maker',
    applicationCategory: 'MultimediaApplication',
    operatingSystem: 'Web Browser',
    offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
};

export default function CollagePage() {
    return (
        <>
            <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
            <CollageMakerClient />
        </>
    );
}
