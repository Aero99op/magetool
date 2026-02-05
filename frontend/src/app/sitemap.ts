import { MetadataRoute } from 'next';

export default function sitemap(): MetadataRoute.Sitemap {
    const baseUrl = 'https://magetool.in';

    // Routes hierarchy
    const routes = [
        '',
        '/image/editor',
        '/image/compressor',
        '/image/converter',
        '/image/passport-photo',
        '/image/collage',
        '/image/remove-background',
        '/video/converter',
        '/video/compressor',
        '/pdf/merger',
        '/pdf/splitter',
        '/pdf/converter',
        '/audio/converter',
        '/tools/qr-generator',
        '/support',
    ].map((route) => ({
        url: `${baseUrl}${route}`,
        lastModified: new Date(),
        changeFrequency: 'weekly' as const,
        priority: route === '' ? 1 : 0.8,
    }));

    return routes;
}
