import { Metadata } from 'next';
import PDFSplitClient from './client';

export const metadata: Metadata = {
    title: 'Split PDF - Extract Pages from PDF Free Online | Magetool',
    description: 'Free online PDF splitter. Extract pages from PDF, split PDF into multiple files. Fast, secure, no signup. Best PDF page extractor tool.',
    keywords: [
        'split pdf',
        'pdf splitter',
        'extract pdf pages',
        'separate pdf pages',
        'pdf page extractor',
        'split pdf online',
        'free pdf splitter',
        'divide pdf',
        'cut pdf pages',
    ],
    openGraph: {
        title: 'Free PDF Splitter - Extract Pages Online | Magetool',
        description: 'Split PDF files and extract specific pages instantly. No signup required.',
        url: 'https://magetool.in/documents/pdf-split',
        type: 'website',
    },
    twitter: {
        card: 'summary_large_image',
        title: 'Split PDF Files Online Free',
        description: 'Extract pages from PDF documents easily.',
    },
    alternates: {
        canonical: '/documents/pdf-split',
    },
};

const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    name: 'Magetool PDF Splitter',
    applicationCategory: 'BusinessApplication',
    operatingSystem: 'Web Browser',
    offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
};

const howToJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'HowTo',
    name: 'How to Split PDF Files',
    step: [
        { '@type': 'HowToStep', text: 'Upload your PDF file' },
        { '@type': 'HowToStep', text: 'Enter page numbers to extract (e.g., 1-5, 10)' },
        { '@type': 'HowToStep', text: 'Click Process to split' },
        { '@type': 'HowToStep', text: 'Download your extracted pages' },
    ],
};

export default function PDFSplitPage() {
    return (
        <>
            <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
            <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(howToJsonLd) }} />
            <PDFSplitClient />
        </>
    );
}
