import { Metadata } from 'next';
import ColorPaletteClient from './client';

export const metadata: Metadata = {
    title: 'Color Palette Generator - Extract Colors from Image | Magetool',
    description: 'Extract dominant color palettes from images online. Get HEX, RGB codes from any photo. Perfect for designers, artists, and developers.',
    keywords: ['color palette generator', 'extract colors from image', 'image color picker', 'color scheme generator', 'dominant colors', 'hex code finder', 'image to hex'],
    openGraph: {
        title: 'Free Color Palette Extractor - Get Colors from Image | Magetool',
        description: 'Generate beautiful color palettes from your photos instantly.',
        url: 'https://magetool.in/images/color-palette',
    },
    alternates: {
        canonical: '/images/color-palette',
    },
};

const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    name: 'Magetool Color Extractor',
    applicationCategory: 'DesignApplication',
    operatingSystem: 'Web Browser',
    offers: {
        '@type': 'Offer',
        price: '0',
        priceCurrency: 'USD',
    },
};

export default function ColorPalettePage() {
    return (
        <>
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
            />
            <ColorPaletteClient />
        </>
    );
}
