'use client';

import { useAppMode } from '@/hooks/useAppMode';
import Header from '@/components/Header';
import BottomNav from '@/components/BottomNav';
import Footer from '@/components/Footer';

export default function AppShell({ children }: { children: React.ReactNode }) {
    const { isMobileApp, isDesktopApp, isWebsite } = useAppMode();

    // Server-side hydration mismatch prevention
    // (Optional: can add "mounted" state if needed, but modern Next.js handles this well)

    return (
        <div className={`app-shell ${isMobileApp ? 'mobile-app-mode' : ''} ${isDesktopApp ? 'desktop-app-mode' : ''}`}>
            {/* Show Header ONLY if NOT a mobile app */}
            {/* Desktop App might still want a Header but maybe a simplified one. For now, we keep it consistent with Website */}
            {/* Show Header ALWAYS (Responsive behavior handled inside Header) */}
            <Header />

            <main className="main-content" style={{
                paddingBottom: isMobileApp ? '80px' : '0' // Add padding for BottomNav
            }}>
                {children}
            </main>

            {/* Show BottomNav ONLY for Mobile App */}
            {isMobileApp && <BottomNav />}

            {/* Show Footer ONLY for Website */}
            {isWebsite && <Footer />}
        </div>
    );
}
