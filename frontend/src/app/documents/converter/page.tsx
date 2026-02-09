import { Metadata } from 'next';
import DocumentConverterClient from './client';
import ContentSection from '@/components/ui/ContentSection';
import { toolContent } from '@/data/tool-content';

export const metadata: Metadata = {
    title: 'Document Converter - PDF to Word, DOCX Free Online | Magetool',
    description: 'Free online document converter. Convert PDF to Word, DOCX to PDF, TXT to PDF and more. Fast, secure, no signup required.',
    keywords: ['pdf to word', 'document converter', 'convert pdf', 'pdf to docx', 'word to pdf', 'docx converter', 'free document converter'],
    openGraph: { title: 'Free PDF to Word Converter Online | Magetool', description: 'Convert documents between PDF, Word, TXT formats.', url: 'https://magetool.in/documents/converter' },
    alternates: { canonical: '/documents/converter' },
};

const jsonLd = { '@context': 'https://schema.org', '@type': 'SoftwareApplication', name: 'Magetool Document Converter', applicationCategory: 'BusinessApplication', operatingSystem: 'Web Browser', offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' } };

export default function DocumentConverterPage() {
    return (
        <>
            <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
            <DocumentConverterClient />
            <ContentSection {...toolContent['pdf-converter']} />
        </>
    );
}
