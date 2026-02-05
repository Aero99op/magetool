import { Metadata } from 'next';
import MuteVideoClient from './client';

export const metadata: Metadata = {
    title: 'Mute Video - Remove Audio | Magetool',
    description: 'Remove audio from video online. Create silent videos by deleting the sound track. Lossless and fast video muting tool.',
    keywords: ['mute video', 'remove audio from video', 'silence video', 'video silencer', 'delete video sound', 'make video silent'],
    openGraph: {
        title: 'Free Mute Video Tool - Remove Audio Online | Magetool',
        description: 'Remove audio from your videos instantly. Create silent clips easily.',
        url: 'https://magetool.in/videos/mute',
    },
    alternates: {
        canonical: '/videos/mute',
    },
};

const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    name: 'Magetool Video Muter',
    applicationCategory: 'MultimediaApplication',
    operatingSystem: 'Web Browser',
    offers: {
        '@type': 'Offer',
        price: '0',
        priceCurrency: 'USD',
    },
};

export default function MuteVideoPage() {
    return (
        <>
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
            />
            <MuteVideoClient />
        </>
    );
}
