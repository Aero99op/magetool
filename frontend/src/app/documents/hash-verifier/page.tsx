import { Metadata } from 'next';
import HashVerifierClient from './client';
import ContentSection from '@/components/ui/ContentSection';
import { toolContent } from '@/data/tool-content';

export const metadata: Metadata = {
    title: 'File Hash Check - Verify File Integrity Online | Magetool',
    description: 'Calculate and verify SHA-256, MD5 hashes online. Check file integrity and detect modifications. Secure client-side processing.',
    keywords: ['file hash checker', 'verify file integrity', 'sha256 calculator', 'md5 checker', 'online checksum verifier', 'file security check'],
    openGraph: {
        title: 'Free File Hash Integrity Checker | Magetool',
        description: 'Verify file integrity with SHA-256 hash calculation directly in your browser.',
        url: 'https://magetool.in/documents/hash-verifier',
    },
    alternates: {
        canonical: '/documents/hash-verifier',
    },
};

const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    name: 'Magetool Hash Verifier',
    applicationCategory: 'SecurityApplication',
    operatingSystem: 'Web Browser',
    offers: {
        '@type': 'Offer',
        price: '0',
        priceCurrency: 'USD',
    },
};

export default function HashVerifierPage() {
    return (
        <>
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
            />
            <HashVerifierClient />
            <ContentSection {...toolContent['document-hash-verifier']} />
        </>
    );
}
