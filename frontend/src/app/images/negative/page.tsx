import { Metadata } from 'next';
import NegativeInvertClient from './client';

export const metadata: Metadata = {
    title: 'Negative Image Converter - Invert Colors Online | Magetool',
    description: 'Invert image colors online to create negative effects. Also supports grayscale, sepia, and solarize filters. Free and fast photo effects tool.',
    keywords: ['negative image converter', 'invert colors', 'photo to negative', 'grayscale converter', 'sepia filter', 'image color inverter', 'photo effects'],
    openGraph: {
        title: 'Free Negative Image Converter & Photo Effects | Magetool',
        description: 'Instantly invert colors or apply grayscale and sepia effects to your photos.',
        url: 'https://magetool.in/images/negative',
    },
    alternates: {
        canonical: '/images/negative',
    },
};

const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    name: 'Magetool Negative Image',
    applicationCategory: 'MultimediaApplication',
    operatingSystem: 'Web Browser',
    offers: {
        '@type': 'Offer',
        price: '0',
        priceCurrency: 'USD',
    },
};

export default function NegativeInvertPage() {
    return (
        <>
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
            />
            <NegativeInvertClient />
        </>
    );
}
