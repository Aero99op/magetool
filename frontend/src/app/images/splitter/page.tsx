import { Metadata } from 'next';
import ImageSplitterClient from './client';

export const metadata: Metadata = {
    title: 'Image Splitter - Split Photos into Grid | Magetool',
    description: 'Split images into grid tiles online. Create photo grids for Instagram, puzzles, or printing. Customize rows and columns. Download as ZIP.',
    keywords: ['image splitter', 'photo grid maker', 'split image online', 'instagram grid maker', 'tile image', 'slice photo', 'image cutter'],
    openGraph: {
        title: 'Free Image Splitter - Create Photo Grids | Magetool',
        description: 'Split your photos into equal pieces for Instagram grids or mosaics in seconds.',
        url: 'https://magetool.in/images/splitter',
    },
    alternates: {
        canonical: '/images/splitter',
    },
};

const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    name: 'Magetool Image Splitter',
    applicationCategory: 'MultimediaApplication',
    operatingSystem: 'Web Browser',
    offers: {
        '@type': 'Offer',
        price: '0',
        priceCurrency: 'USD',
    },
};

export default function ImageSplitterPage() {
    return (
        <>
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
            />
            <ImageSplitterClient />
        </>
    );
}
