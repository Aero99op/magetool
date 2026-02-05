import { Metadata } from 'next';
import AddMusicClient from './client';

export const metadata: Metadata = {
    title: 'Add Music to Video - Merge Audio and Video | Magetool',
    description: 'Add music or background audio to your videos online. Combine MP3 with MP4. Replace video audio or mix sound tracks easily.',
    keywords: ['add music to video', 'add audio to video', 'merge audio and video', 'replace video sound', 'video background music', 'mp4 music adder'],
    openGraph: {
        title: 'Free Tool to Add Music to Video | Magetool',
        description: 'Add background music to your videos instantly. Mix or replace audio.',
        url: 'https://magetool.in/videos/add-music',
    },
    alternates: {
        canonical: '/videos/add-music',
    },
};

const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    name: 'Magetool Add Music to Video',
    applicationCategory: 'MultimediaApplication',
    operatingSystem: 'Web Browser',
    offers: {
        '@type': 'Offer',
        price: '0',
        priceCurrency: 'USD',
    },
};

export default function AddMusicPage() {
    return (
        <>
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
            />
            <AddMusicClient />
        </>
    );
}
