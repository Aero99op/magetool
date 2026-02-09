import { Metadata } from 'next';
import ToImageClient from './client';
import ContentSection from '@/components/ui/ContentSection';
import { toolContent } from '@/data/tool-content';

export const metadata: Metadata = {
    title: 'PDF to Image Converter - Convert PDF to JPG, PNG | Magetool',
    description: 'Convert PDF to JPG, PNG, or WebP images online free. Extract pages from PDF as high-quality images. Supports batch conversion.',
    keywords: ['pdf to image', 'pdf to jpg', 'pdf to png', 'convert pdf to image', 'pdf to webp', 'pdf pages to images', 'free pdf to image converter'],
    openGraph: {
        title: 'Free PDF to Image Converter Online | Magetool',
        description: 'Convert PDF pages to high-quality JPG, PNG, or WebP images.',
        url: 'https://magetool.in/documents/to-image',
    },
    alternates: {
        canonical: '/documents/to-image',
    },
};

const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    name: 'Magetool PDF to Image',
    applicationCategory: 'MultimediaApplication',
    operatingSystem: 'Web Browser',
    offers: {
        '@type': 'Offer',
        price: '0',
        priceCurrency: 'USD',
    },
};

export default function ToImagePage() {
    return (
        <>
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
            />
            <ToImageClient />
            <ContentSection {...toolContent['document-pdf-to-image']} />
        </>
    );
}
