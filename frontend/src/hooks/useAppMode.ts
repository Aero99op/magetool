import { useState, useEffect } from 'react';

type AppMode = 'website' | 'mobile-app' | 'desktop-app';

export function useAppMode() {
    const [mode, setMode] = useState<AppMode>('website');

    useEffect(() => {
        // Check if running in standalone mode (PWA/TWA)
        const isStandalone =
            window.matchMedia('(display-mode: standalone)').matches ||
            (window.navigator as any).standalone ||
            document.referrer.includes('android-app://');

        if (isStandalone) {
            // Check device type
            const uA = navigator.userAgent.toLowerCase();
            const isMobile = /android|iphone|ipad|ipod/.test(uA);

            setMode(isMobile ? 'mobile-app' : 'desktop-app');
        } else {
            setMode('website');
        }
    }, []);

    return {
        mode,
        isWebsite: mode === 'website',
        isMobileApp: mode === 'mobile-app',
        isDesktopApp: mode === 'desktop-app',
    };
}
