import { Metadata } from 'next';
import SVGConverterClient from './client';

export const metadata: Metadata = {
    title: 'SVG Converter - Convert PNG/JPG to SVG Vector | Magetool',
    description: 'Convert raster images (JPG, PNG, BMP) to scalable vector graphics (SVG). Perfect for logos and icons. Adjust smoothing and color depth.',
    keywords: ['svg converter', 'jpg to svg', 'png to svg', 'image to vector', 'raster to vector', 'vectorizer', 'online svg maker'],
    openGraph: {
        title: 'Free SVG Converter - JPG/PNG to Vector Online | Magetool',
        description: 'Convert your images to high-quality SVG vectors for free. Best for logos and illustrations.',
        url: 'https://magetool.in/images/svg-converter',
    },
    alternates: {
        canonical: '/images/svg-converter',
    },
};

const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    name: 'Magetool SVG Converter',
    applicationCategory: 'DesignApplication',
    operatingSystem: 'Web Browser',
    offers: {
        '@type': 'Offer',
        price: '0',
        priceCurrency: 'USD',
    },
};

export default function SVGConverterPage() {
    return (
        <>
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
            />
            <SVGConverterClient />
        </>
    );
}
