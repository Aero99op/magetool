import type { Metadata } from 'next';
import ToolContent from '@/components/ToolContent';
import ImageEditorClient from './client';

export const metadata: Metadata = {
    title: 'Advanced Photo Editor & Collage Maker - Magetool',
    description: 'Free online professional photo editor. Adjust brightness, contrast, crop images, and create beautiful collages with 30+ layouts. Zero-upload, secure, and fast.',
    keywords: ['online photo editor', 'collage maker', 'image editor', 'passport photo maker', 'free image tools', 'photo filter'],
};

export default function ImageEditorPage() {
    return (
        <div>
            <ImageEditorClient />
            <div className="container" style={{ paddingBottom: '80px' }}>
                <ToolContent
                    overview="Transform your photos with our professional-grade online Image Editor. Whether you need to crop, resize, apply filters, or create a stunning collage, our tool offers a comprehensive suite of features usually found only in desktop software. With an intuitive interface and real-time preview, you can fine-tune every aspect of your image – from brightness and contrast to advanced color grading. Plus, our built-in Collage Maker lets you combine multiple memories into one beautiful layout."
                    features={[
                        "Advanced Adjustments: Fine-tune brightness, contrast, saturation, exposure, and temperature.",
                        "Smart Filters: Apply professional presets like Vintage, Black & White, Sepia, and more.",
                        "Collage Maker: Choose from over 20+ layouts including grids, masonry, and freestyle.",
                        "Privacy Protected: All editing happens in your browser. Your photos never leave your device.",
                        "Instant Resize & Crop: Preset ratios for Instagram, Facebook, Twitter, and print.",
                        "Text & Stickers: Add custom typography and fun elements to your designs."
                    ]}
                    howTo={[
                        { step: "Upload Photo", description: "Drag and drop your image onto the canvas or click to browse." },
                        { step: "Edit or Adjust", description: "Use the side panel to adjust sliders, apply filters, or crop your image." },
                        { step: "Create Collage (Optional)", description: "Switch to 'Collage Mode' to combine multiple photos." },
                        { step: "Export", description: "Click 'Download' to save your masterpiece in high quality (JPG/PNG)." }
                    ]}
                    faqs={[
                        { question: "Is this photo editor really free?", answer: "Yes, all features including the collage maker and advanced filters are completely free." },
                        { question: "Do you store my photos?", answer: "No. Our technology runs entirely in your browser using WebGL. Your images are never uploaded to a server." },
                        { question: "Can I edit RAW files?", answer: "We support standard formats like JPG, PNG, and WebP. For RAW files, we recommend converting them first." },
                        { question: "Does it work on mobile?", answer: "Yes, the interface is fully responsive and touch-friendly for editing on phones and tablets." }
                    ]}
                />
            </div>
        </div>
    );
}
