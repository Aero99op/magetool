import { Metadata } from 'next';
import PDFUnlockClient from './client';
import ContentSection from '@/components/ui/ContentSection';
import { toolContent } from '@/data/tool-content';

export const metadata: Metadata = {
    title: 'Unlock PDF - Remove Password from PDF | Magetool',
    description: 'Remove password protection from PDF files. Unlock PDF documents instantly with correct password. Free, secure, and processing happens in-memory.',
    keywords: ['unlock pdf', 'remove pdf password', 'decrypt pdf', 'pdf unlocker', 'open locked pdf', 'remove pdf restrictions'],
    openGraph: {
        title: 'Free PDF Unlocker - Remove Passwords Online | Magetool',
        description: 'Remove passwords from PDF files instantly and securely.',
        url: 'https://magetool.in/documents/pdf-unlock',
    },
    alternates: {
        canonical: '/documents/pdf-unlock',
    },
};

const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    name: 'Magetool PDF Unlocker',
    applicationCategory: 'UtilityApplication',
    operatingSystem: 'Web Browser',
    offers: {
        '@type': 'Offer',
        price: '0',
        priceCurrency: 'USD',
    },
};

export default function PDFUnlockPage() {
    return (
        <>
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
            />
            <PDFUnlockClient />
            <ContentSection {...toolContent['pdf-unlock']} />
        </>
    );
}
