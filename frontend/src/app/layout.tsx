import type { Metadata, Viewport } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import JsonLd from '@/components/JsonLd';
import AppShell from '@/components/AppShell';

import { ServerStatus } from '@/components/ServerStatus';
import { WakeUpManager } from '@/components/WakeUpManager';
import AnimatedBackground from '@/components/ui/AnimatedBackground';
import MageBot from '@/components/MageBot';

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
    metadataBase: new URL('https://magetool.in'),
    alternates: {
        canonical: '/',
    },
    openGraph: {
        title: 'Magetool - Ultimate File Utility Platform',
        description: 'Convert, edit, and compress files online for free. Support for PDF, Images, Video, and Audio.',
        url: 'https://magetool.in',
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
    manifest: '/manifest.json',
    icons: {
        icon: '/logo.png',
        shortcut: '/logo.png',
        apple: '/logo.png',
    },
    appleWebApp: {
        capable: true,
        statusBarStyle: 'black-translucent',
        title: 'Magetool',
    },
    verification: {
        google: 'pHa0sLjbGcsWDSIVmIzmx8FMKYCYudi27qzVrMqTzIk',
    },
};

export const viewport: Viewport = {
    width: 'device-width',
    initialScale: 1,
    maximumScale: 1,
    userScalable: false,
    viewportFit: 'cover',
    themeColor: [
        { media: '(prefers-color-scheme: light)', color: '#ffffff' },
        { media: '(prefers-color-scheme: dark)', color: '#000000' },
    ],
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
                {/* Theme initialization - runs before React to prevent flash */}
                <script
                    dangerouslySetInnerHTML={{
                        __html: `
                            (function() {
                                try {
                                    var theme = localStorage.getItem('theme');
                                    if (theme === 'light') {
                                        document.documentElement.setAttribute('data-theme', 'light');
                                    } else {
                                        document.documentElement.setAttribute('data-theme', 'dark');
                                    }
                                    var anim = localStorage.getItem('animationsEnabled');
                                    document.documentElement.setAttribute('data-animate', anim === 'false' ? 'off' : 'on');
                                } catch (e) {}
                            })();
                        `,
                    }}
                />
                <ServerStatus />
                <WakeUpManager />
                <JsonLd />
                <AnimatedBackground />
                <MageBot />
                <AppShell>
                    {children}
                </AppShell>

                <script
                    dangerouslySetInnerHTML={{
                        __html: `
                            if ('serviceWorker' in navigator) {
                                window.addEventListener('load', function() {
                                    navigator.serviceWorker.register('/sw.js');
                                });
                            }
                        `,
                    }}
                />
            </body>
        </html>
    );
}
