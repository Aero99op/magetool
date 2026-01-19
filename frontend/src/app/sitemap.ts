import { MetadataRoute } from 'next';

export default function sitemap(): MetadataRoute.Sitemap {
    const baseUrl = 'https://magetool.site'; // Replace with actual domain

    const routes = [
        '',
        '/documents',
        '/images',
        '/videos',
        '/audio',
        '/images/size-adjuster',
        '/images/converter',
        '/images/compressor',
        '/documents/converter',
        '/documents/pdf-merge',
        '/videos/converter',
        '/videos/compressor',
    ].map((route) => ({
        url: `${baseUrl}${route}`,
        lastModified: new Date(),
        changeFrequency: 'weekly' as const,
        priority: route === '' ? 1 : 0.8,
    }));

    return routes;
}
