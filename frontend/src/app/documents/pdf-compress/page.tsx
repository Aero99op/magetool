import { Metadata } from 'next';
import PDFCompressClient from './client';
import ContentSection from '@/components/ui/ContentSection';
import { toolContent } from '@/data/tool-content';

export const metadata: Metadata = {
    title: 'Compress PDF - Reduce PDF Size Online Free | Magetool',
    description: 'Compress PDF file size online for free. Reduce PDF size while maintaining quality. 3 compression levels. No email required.',
    keywords: ['compress pdf', 'reduce pdf size', 'online pdf compressor', 'resize pdf', 'shrink pdf', 'pdf optimizer', 'free pdf compressor'],
    openGraph: {
        title: 'Free PDF Compressor Online | Magetool',
        description: 'Reduce PDF file size significantly while preserving quality.',
        url: 'https://magetool.in/documents/pdf-compress',
    },
    alternates: {
        canonical: '/documents/pdf-compress',
    },
};

const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    name: 'Magetool PDF Compressor',
    applicationCategory: 'UtilityApplication',
    operatingSystem: 'Web Browser',
    offers: {
        '@type': 'Offer',
        price: '0',
        priceCurrency: 'USD',
    },
};

export default function PDFCompressPage() {
    return (
        <>
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
            />
            <PDFCompressClient />
            <ContentSection {...toolContent['pdf-compress']} />
        </>
    );
}
