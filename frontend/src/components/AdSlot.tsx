'use client';

interface AdSlotProps {
    variant: 'horizontal' | 'inline' | 'square';
    className?: string;
}

export default function AdSlot({ variant, className = '' }: AdSlotProps) {
    const sizes = {
        horizontal: { width: '100%', maxWidth: '728px', height: '90px' },
        inline: { width: '100%', maxWidth: '100%', height: '100px' },
        square: { width: '300px', maxWidth: '300px', height: '250px' },
    };

    const size = sizes[variant];

    return (
        <div className={`ad-slot ad-slot-${variant} ${className}`} style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            width: size.width,
            maxWidth: size.maxWidth,
            height: size.height,
            margin: '0 auto',
            background: 'linear-gradient(135deg, rgba(255,255,255,0.01), rgba(255,255,255,0.03))',
            border: '1px dashed rgba(255,255,255,0.06)',
            borderRadius: '8px',
        }}>
            <span style={{
                fontSize: '0.6rem',
                color: 'rgba(255,255,255,0.15)',
                textTransform: 'uppercase',
                letterSpacing: '2px',
            }}>
                Advertisement
            </span>

            {/* 
              AdSense Code:
              <ins className="adsbygoogle"
                   style={{ display: 'block' }}
                   data-ad-client="ca-pub-XXXXXXXXXXXXXXXX"
                   data-ad-slot="XXXXXXXXXX"
                   data-ad-format="auto"
                   data-full-width-responsive="true">
              </ins>
            */}
        </div>
    );
}
