import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import JsonLd from '@/components/JsonLd';

import { ServerStatus } from '@/components/ServerStatus';
import { WakeUpManager } from '@/components/WakeUpManager';

const inter = Inter({
    subsets: ['latin'],
    display: 'swap',
    variable: '--font-inter',
});

export const metadata: Metadata = {
    title: {
        default: 'Magetool - Free Online File Converter & Editor',
        template: '%s | Magetool',
    },
    description: 'Magetool is the best free online file tool. Convert PDF, compress images, edit videos, and more. No ads, no limits, secure and fast.',
    keywords: ['Magetool', 'magetool online', 'magetool converter', 'file converter', 'pdf tools', 'image compressor', 'video editor', 'audio converter', 'free online tools'],
    authors: [{ name: 'Magetool Team' }],
    creator: 'Magetool',
    publisher: 'Magetool',
    formatDetection: {
        email: false,
        address: false,
        telephone: false,
    },
    openGraph: {
        title: 'Magetool - Ultimate File Utility Platform',
        description: 'Convert, edit, and compress files online for free. Support for PDF, Images, Video, and Audio.',
        url: 'https://magetool.site',
        siteName: 'Magetool',
        locale: 'en_US',
        type: 'website',
    },
    twitter: {
        card: 'summary_large_image',
        title: 'Magetool - Free Online File Tools',
        description: 'The ultimate all-in-one file converter and editor.',
        creator: '@magetool', // Replace with actual handle if available
    },
    robots: {
        index: true,
        follow: true,
        googleBot: {
            index: true,
            follow: true,
            'max-video-preview': -1,
            'max-image-preview': 'large',
            'max-snippet': -1,
        },
    },
};

export default function RootLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <html lang="en" className={inter.variable}>
            <head>
                {/* Google AdSense */}
                <script
                    async
                    src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-7253353658623253"
                    crossOrigin="anonymous"
                />
            </head>
            <body>
                <ServerStatus />
                <WakeUpManager />
                <JsonLd />
                <Header />
                <main className="main-content">
                    {children}
                </main>
                <Footer />
            </body>
        </html>
    );
}
