import { Metadata } from 'next';
import FileSizeAdjusterClient from './client';
import ContentSection from '@/components/ui/ContentSection';
import { toolContent } from '@/data/tool-content';

export const metadata: Metadata = {
    title: 'Increase File Size - Change File Size in MB/KB | Magetool',
    description: 'Adjust file size online. Increase file size to meet upload requirements or decrease file size with compression. Supports all file types.',
    keywords: ['increase file size', 'change file size', 'file size adjuster', 'make file bigger', 'increase pdf size', 'increase image size', 'file padder'],
    openGraph: {
        title: 'Free File Size Adjuster - Increase or Decrease Size | Magetool',
        description: 'Easily increase file size to meet minimum upload requirements or compress to save space.',
        url: 'https://magetool.in/documents/size-adjuster',
    },
    alternates: {
        canonical: '/documents/size-adjuster',
    },
};

const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    name: 'Magetool Size Adjuster',
    applicationCategory: 'UtilityApplication',
    operatingSystem: 'Web Browser',
    offers: {
        '@type': 'Offer',
        price: '0',
        priceCurrency: 'USD',
    },
};

export default function FileSizeAdjusterPage() {
    return (
        <>
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
            />
            <FileSizeAdjusterClient />
            <ContentSection {...toolContent['document-size-adjuster']} />
        </>
    );
}
