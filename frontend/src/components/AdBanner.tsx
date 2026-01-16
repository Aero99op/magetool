'use client';

interface AdBannerProps {
    slot: 'header' | 'sidebar' | 'in-feed' | 'bottom';
    className?: string;
}

const AD_SIZES = {
    header: { width: 728, height: 90, label: 'Leaderboard 728x90' },
    sidebar: { width: 300, height: 250, label: 'Rectangle 300x250' },
    'in-feed': { width: 336, height: 280, label: 'In-feed 336x280' },
    bottom: { width: 970, height: 250, label: 'Billboard 970x250' },
};

export default function AdBanner({ slot, className = '' }: AdBannerProps) {
    const adSize = AD_SIZES[slot];

    return (
        <div className={`ad-container ad-${slot} ${className}`}>
            {/* Replace this div with actual AdSense code in production */}
            <div
                className="ad-placeholder"
                style={{
                    width: '100%',
                    maxWidth: `${adSize.width}px`,
                    height: `${adSize.height}px`,
                    margin: '0 auto',
                }}
            >
                <div className="ad-label">
                    <span className="ad-icon">📢</span>
                    <span className="ad-text">Advertisement</span>
                </div>
                <div className="ad-size">{adSize.label}</div>

                {/* 
                  AdSense Code goes here:
                  <ins className="adsbygoogle"
                       style={{ display: 'block' }}
                       data-ad-client="ca-pub-XXXXXXXXXXXXXXXX"
                       data-ad-slot="XXXXXXXXXX"
                       data-ad-format="auto"
                       data-full-width-responsive="true">
                  </ins>
                */}
            </div>

            <style jsx>{`
                .ad-container {
                    display: flex;
                    justify-content: center;
                    padding: 12px;
                    background: rgba(0, 0, 0, 0.2);
                    border-radius: 8px;
                }
                
                .ad-placeholder {
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    justify-content: center;
                    gap: 8px;
                    background: linear-gradient(135deg, rgba(255,255,255,0.02), rgba(255,255,255,0.05));
                    border: 1px dashed rgba(255,255,255,0.15);
                    border-radius: 6px;
                    color: rgba(255,255,255,0.3);
                }
                
                .ad-label {
                    display: flex;
                    align-items: center;
                    gap: 6px;
                    font-size: 0.75rem;
                    text-transform: uppercase;
                    letter-spacing: 1px;
                }
                
                .ad-icon {
                    font-size: 1rem;
                    opacity: 0.5;
                }
                
                .ad-size {
                    font-size: 0.65rem;
                    opacity: 0.4;
                }
                
                @media (max-width: 768px) {
                    .ad-header .ad-placeholder {
                        height: 50px !important;
                    }
                    
                    .ad-bottom .ad-placeholder {
                        height: 100px !important;
                    }
                }
            `}</style>
        </div>
    );
}
