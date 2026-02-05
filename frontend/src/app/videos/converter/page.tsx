import { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Video Converter - Convert MP4, MKV, AVI Free Online | Magetool',
    description: 'Free online video converter. Convert MP4 to MKV, AVI to MP4, MOV to WebM and more. Change resolution, compress videos. No signup required.',
    keywords: ['video converter', 'convert video', 'mp4 converter', 'mkv to mp4', 'avi converter', 'video format converter', 'free video converter', 'mov to mp4'],
    openGraph: { title: 'Free Video Converter Online | Magetool', description: 'Convert videos between MP4, MKV, AVI, MOV formats.', url: 'https://magetool.in/videos/converter' },
    alternates: { canonical: '/videos/converter' },
};

const jsonLd = { '@context': 'https://schema.org', '@type': 'SoftwareApplication', name: 'Magetool Video Converter', applicationCategory: 'MultimediaApplication', operatingSystem: 'Web Browser', offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' } };

// Keep original component as default export
import VideoConverterClient from './client';

export default function VideoConverterPage() {
    return (
        <>
            <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
            <VideoConverterClient />
        </>
    );
}
