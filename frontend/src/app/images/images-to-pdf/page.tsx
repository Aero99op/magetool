import { Metadata } from 'next';
import ImagesToPdfClient from './client';
import ContentSection from '@/components/ui/ContentSection';
import { toolContent } from '@/data/tool-content';

export const metadata: Metadata = {
    title: 'Images to PDF Converter - Merge Photos to PDF | Magetool',
    description: 'Convert multiple images to a single PDF document. Support JPG, PNG, GIF, BMP. Reorder pages, adjust layout and quality settings. Free online tool.',
    keywords: ['images to pdf', 'convert jpg to pdf', 'photo to pdf', 'merge images to pdf', 'png to pdf', 'create pdf from photos', 'image binder'],
    openGraph: {
        title: 'Free Image to PDF Converter - Merge Photos Online | Magetool',
        description: 'Combine multiple photos into a professional PDF document. Easy drag-and-drop interface.',
        url: 'https://magetool.in/images/images-to-pdf',
    },
    alternates: {
        canonical: '/images/images-to-pdf',
    },
};

const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    name: 'Magetool Image to PDF',
    applicationCategory: 'UtilityApplication',
    operatingSystem: 'Web Browser',
    offers: {
        '@type': 'Offer',
        price: '0',
        priceCurrency: 'USD',
    },
};

export default function ImagesToPdfPage() {
    return (
        <>
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
            />
            <ImagesToPdfClient />
            <ContentSection {...toolContent['images-to-pdf']} />
        </>
    );
}
