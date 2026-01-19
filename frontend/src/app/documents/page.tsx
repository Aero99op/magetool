import type { Metadata } from 'next';
import DocumentsPageClient from './client';

export const metadata: Metadata = {
    title: 'Free Online PDF & Document Tools - Merge, Split, Convert - Magetool',
    description: 'Magetool Document Tools: The best free online PDF editor. Merge PDF, Split PDF, Compress PDF, and convert Office documents. Privacy focused.',
    keywords: ['pdf tools', 'merge pdf online', 'pdf compressor', 'document converter', 'magetool pdf', 'split pdf', 'free pdf editor'],
    openGraph: {
        title: 'Magetool PDF & Document Suite - Free Online Tools',
        description: 'Manage your documents with professional PDF tools. Merge, split, compress, and protect files for free.',
    },
};

export default function DocumentsPage() {
    return <DocumentsPageClient />;
}
