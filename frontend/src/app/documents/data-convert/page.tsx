import { Metadata } from 'next';
import DataConvertClient from './client';

export const metadata: Metadata = {
    title: 'Data Converter - JSON to CSV, XML Converter | Magetool',
    description: 'Convert data files online for free. Transform JSON to CSV, CSV to XML, JSON to XML and more. Developer-friendly data formatting tool.',
    keywords: ['data converter', 'json to csv', 'csv to json', 'xml converter', 'json to xml', 'csv to xml', 'data format converter'],
    openGraph: {
        title: 'Free Data Format Converter Online (JSON/CSV/XML) | Magetool',
        description: 'Convert between JSON, CSV, and XML data formats instantly.',
        url: 'https://magetool.in/documents/data-convert',
    },
    alternates: {
        canonical: '/documents/data-convert',
    },
};

const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    name: 'Magetool Data Converter',
    applicationCategory: 'DeveloperApplication',
    operatingSystem: 'Web Browser',
    offers: {
        '@type': 'Offer',
        price: '0',
        priceCurrency: 'USD',
    },
};

export default function DataConvertPage() {
    return (
        <>
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
            />
            <DataConvertClient />
        </>
    );
}
