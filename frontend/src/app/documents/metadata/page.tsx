import { Metadata } from 'next';
import DocumentMetadataClient from './client';

export const metadata: Metadata = {
    title: 'Metadata Viewer - View PDF & Doc Properties | Magetool',
    description: 'Free online document metadata viewer. View hidden properties of PDF, DOC, and DOCX files. Check author, creation date, software used, and more.',
    keywords: ['metadata viewer', 'view pdf metadata', 'document properties', 'check pdf author', 'file metadata reader', 'doc metadata', 'free metadata tool'],
    openGraph: {
        title: 'Free Document Metadata Viewer | Magetool',
        description: 'View hidden metadata and properties of your PDF and Word documents.',
        url: 'https://magetool.in/documents/metadata',
    },
    alternates: {
        canonical: '/documents/metadata',
    },
};

const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    name: 'Magetool Metadata Viewer',
    applicationCategory: 'UtilityApplication',
    operatingSystem: 'Web Browser',
    offers: {
        '@type': 'Offer',
        price: '0',
        priceCurrency: 'USD',
    },
};

export default function DocumentMetadataPage() {
    return (
        <>
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
            />
            <DocumentMetadataClient />
        </>
    );
}
