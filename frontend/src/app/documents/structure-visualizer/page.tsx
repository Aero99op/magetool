import { Metadata } from 'next';
import StructureVisualizerClient from './client';
import ContentSection from '@/components/ui/ContentSection';
import { toolContent } from '@/data/tool-content';

export const metadata: Metadata = {
    title: 'Structure Visualizer - Text to Diagram Generator | Magetool',
    description: 'Transform text, code, or data into visual structures. Create Flowcharts, Mindmaps, Trees, Graphs, and more from simple text input. 20+ Visualization types supported.',
    keywords: ['text to diagram', 'structure visualizer', 'text to tree', 'mindmap generator', 'code visualizer', 'mermaid editor', 'flowchart maker'],
    openGraph: {
        title: 'Free Structure Visualizer - Text to Diagram | Magetool',
        description: 'Convert text into visual diagrams instantly. Supports Flowcharts, Mindmaps, Trees, and more.',
        url: 'https://magetool.in/documents/structure-visualizer',
    },
    alternates: {
        canonical: '/documents/structure-visualizer',
    },
};

const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    name: 'Magetool Structure Visualizer',
    applicationCategory: 'UtilityApplication',
    operatingSystem: 'Web Browser',
    offers: {
        '@type': 'Offer',
        price: '0',
        priceCurrency: 'USD',
    },
};

export default function StructureVisualizerPage() {
    return (
        <>
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
            />
            <StructureVisualizerClient />
            {/* Fallback for content section if not yet added to tool-content */}
            {toolContent['structure-visualizer'] && (
                <ContentSection {...toolContent['structure-visualizer']} />
            )}
        </>
    );
}
