export default function JsonLd() {
    return (
        <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{
                __html: JSON.stringify({
                    '@context': 'https://schema.org',
                    '@type': 'SoftwareApplication',
                    name: 'Magetool',
                    alternateName: ['Magetool Online', 'Magetool Converter', 'Magetool Editor'],
                    url: 'https://magetool.in',
                    applicationCategory: 'MultimediaApplication',
                    operatingSystem: 'Any',
                    offers: {
                        '@type': 'Offer',
                        price: '0',
                        priceCurrency: 'USD',
                    },
                    description: 'Free online tools for image, video, audio, and document conversion and editing.',
                    aggregateRating: {
                        '@type': 'AggregateRating',
                        ratingValue: '4.8',
                        ratingCount: '1250',
                    },
                    sameAs: [
                        'https://twitter.com/magetool',
                        'https://facebook.com/magetool',
                        'https://instagram.com/magetool'
                    ]
                }),
            }}
        />
    );
}
