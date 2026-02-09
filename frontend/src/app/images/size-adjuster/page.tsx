import type { Metadata } from 'next';
import ImageSizeAdjusterClient from './client';
import ContentSection from '@/components/ui/ContentSection';
import { toolContent } from '@/data/tool-content';

export const metadata: Metadata = {
    title: 'Reduce Image Size in KB/MB Online (Free) - Magetool',
    description: 'Compress images to specific file size in KB or MB. Reduce JPG, PNG, and WebP size online without losing quality. Perfect for passport photos and forms.',
    keywords: ['reduce image size', 'compress image to 20kb', 'image size reducer', 'resize image kb', 'online photo compressor'],
    openGraph: {
        title: 'Free Image Size Reducer - Compress to Exact KB/MB',
        description: 'Need an image at exactly 20KB? Use Magetool to resize and compress photos to any target file size instantly.',
    },
};

export default function ImageSizeAdjusterPage() {
    return (
        <>
            <ImageSizeAdjusterClient />
            <ContentSection {...toolContent['image-size-adjuster']} />
        </>
    );
}
