import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

const inter = Inter({
    subsets: ['latin'],
    display: 'swap',
    variable: '--font-inter',
});

export const metadata: Metadata = {
    title: 'Magetool - Ultimate File Utility Platform',
    description: 'Enterprise-grade file conversion, editing, and manipulation tools. Convert images, videos, audio, and documents with zero friction.',
    keywords: 'file converter, image converter, video converter, pdf tools, audio converter',
};

export default function RootLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <html lang="en" className={inter.variable}>
            <body>
                <Header />
                <main className="main-content">
                    {children}
                </main>
                <Footer />
            </body>
        </html>
    );
}
