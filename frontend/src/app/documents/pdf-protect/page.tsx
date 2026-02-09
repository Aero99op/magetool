import { Metadata } from 'next';
import PDFProtectClient from './client';
import ContentSection from '@/components/ui/ContentSection';
import { toolContent } from '@/data/tool-content';

export const metadata: Metadata = {
    title: 'Protect PDF - Encrypt PDF with Password | Magetool',
    description: 'Add password protection to PDF files for free. Encrypt your confidential documents securely online. No registration required.',
    keywords: ['protect pdf', 'encrypt pdf', 'lock pdf', 'password protect pdf', 'secure pdf', 'add pdf password', 'pdf security'],
    openGraph: {
        title: 'Secure PDF with Password Protection Online | Magetool',
        description: 'Encrypt important PDF documents with strong passwords.',
        url: 'https://magetool.in/documents/pdf-protect',
    },
    alternates: {
        canonical: '/documents/pdf-protect',
    },
};

const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    name: 'Magetool PDF Protector',
    applicationCategory: 'SecurityApplication',
    operatingSystem: 'Web Browser',
    offers: {
        '@type': 'Offer',
        price: '0',
        priceCurrency: 'USD',
    },
};

export default function PDFProtectPage() {
    return (
        <>
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
            />
            <PDFProtectClient />
            <ContentSection {...toolContent['pdf-protect']} />
        </>
    );
}
