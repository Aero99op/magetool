import { Metadata } from 'next';
import OCRScannerClient from './client';

export const metadata: Metadata = {
    title: 'OCR Scanner - Extract Text from Images | Magetool',
    description: 'Convert images to text online with our free OCR scanner. Extract text from photos, screenshots, and scanned documents. Support multiple languages.',
    keywords: ['ocr scanner', 'image to text', 'extract text from image', 'online ocr', 'photo to text', 'jpg to text', 'text extractor'],
    openGraph: {
        title: 'Free Online OCR Scanner - Image to Text | Magetool',
        description: 'Instantly extract text from images and documents with high accuracy.',
        url: 'https://magetool.in/images/ocr',
    },
    alternates: {
        canonical: '/images/ocr',
    },
};

const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    name: 'Magetool OCR Scanner',
    applicationCategory: 'UtilityApplication',
    operatingSystem: 'Web Browser',
    offers: {
        '@type': 'Offer',
        price: '0',
        priceCurrency: 'USD',
    },
};

export default function OCRScannerPage() {
    return (
        <>
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
            />
            <OCRScannerClient />
        </>
    );
}
