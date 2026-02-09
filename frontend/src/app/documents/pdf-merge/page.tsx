import { Metadata } from 'next';
import PDFMergeClient from './client';
import ContentSection from '@/components/ui/ContentSection';
import { toolContent } from '@/data/tool-content';

export const metadata: Metadata = {
    title: 'Merge PDF - Combine PDF Files Free Online | Magetool',
    description: 'Free online PDF merger. Combine multiple PDF files into one document. Fast, secure, no signup required. Best PDF joiner tool to merge PDFs instantly.',
    keywords: [
        'merge pdf',
        'combine pdf',
        'pdf merger',
        'join pdf',
        'pdf joiner',
        'merge pdf files',
        'combine pdf files',
        'pdf combiner',
        'merge pdf online',
        'free pdf merger',
    ],
    openGraph: {
        title: 'Free PDF Merger - Combine PDF Files Online | Magetool',
        description: 'Merge multiple PDF files into one document. Arrange pages, combine PDFs instantly. No signup required.',
        url: 'https://magetool.in/documents/pdf-merge',
        type: 'website',
        // type: 'website', // Duplicate key removed
    },
    twitter: {
        card: 'summary_large_image',
        title: 'Merge PDF Files Online Free',
        description: 'Combine multiple PDFs into one document. Fast and secure.',
    },
    alternates: {
        canonical: '/documents/pdf-merge',
    },
};

const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    name: 'Magetool PDF Merger',
    applicationCategory: 'BusinessApplication',
    operatingSystem: 'Web Browser',
    offers: {
        '@type': 'Offer',
        price: '0',
        priceCurrency: 'USD',
    },
    aggregateRating: {
        '@type': 'AggregateRating',
        ratingValue: '4.9',
        ratingCount: '2340',
    },
};

const howToJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'HowTo',
    name: 'How to Merge PDF Files Online',
    description: 'Combine multiple PDF documents into one file',
    step: [
        {
            '@type': 'HowToStep',
            name: 'Upload PDFs',
            text: 'Select or drag and drop multiple PDF files',
        },
        {
            '@type': 'HowToStep',
            name: 'Arrange Order',
            text: 'Use arrows to reorder pages as needed',
        },
        {
            '@type': 'HowToStep',
            name: 'Merge',
            text: 'Click Merge to combine all PDFs',
        },
        {
            '@type': 'HowToStep',
            name: 'Download',
            text: 'Download your merged PDF file',
        },
    ],
};

export default function PDFMergePage() {
    return (
        <>
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
            />
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(howToJsonLd) }}
            />
            <PDFMergeClient />
            <ContentSection {...toolContent['pdf-merge']} />
        </>
    );
}
