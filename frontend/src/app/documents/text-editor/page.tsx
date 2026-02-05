import { Metadata } from 'next';
import TextEditorClient from './client';

export const metadata: Metadata = {
    title: 'Text Editor Online - Edit Text and Code Free | Magetool',
    description: 'Free online text editor and code editor. Edit TXT, MD, JSON, CSV files in your browser. Features word count, line count, and find & replace.',
    keywords: ['text editor online', 'notepad online', 'code editor', 'edit text file', 'edit json online', 'edit markdown online', 'free text editor'],
    openGraph: {
        title: 'Free Online Text & Code Editor | Magetool',
        description: 'Lightweight, private online text editor with code support.',
        url: 'https://magetool.in/documents/text-editor',
    },
    alternates: {
        canonical: '/documents/text-editor',
    },
};

const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    name: 'Magetool Text Editor',
    applicationCategory: 'UtilityApplication',
    operatingSystem: 'Web Browser',
    offers: {
        '@type': 'Offer',
        price: '0',
        priceCurrency: 'USD',
    },
};

export default function TextEditorPage() {
    return (
        <>
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
            />
            <TextEditorClient />
        </>
    );
}
