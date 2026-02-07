'use client';

import { motion } from 'framer-motion';
import { ReactNode } from 'react';

interface PremiumCardProps {
    children: ReactNode;
    className?: string;
    onClick?: () => void;
    hoverEffect?: boolean;
    delay?: number;
    style?: React.CSSProperties;
}

export default function PremiumCard({
    children,
    className = '',
    onClick,
    hoverEffect = true,
    delay = 0,
    style
}: PremiumCardProps) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay }}
            whileHover={hoverEffect ? {
                y: -8,
                transition: { duration: 0.3 }
            } : undefined}
            onClick={onClick}
            className={`glass-card ${className}`}
            style={{
                cursor: onClick ? 'pointer' : 'default',
                ...style
            }}
        >
            {/* Inner Glow Mesh */}
            <div
                style={{
                    position: 'absolute',
                    inset: 0,
                    background: 'radial-gradient(circle at top right, rgba(255,255,255,0.03), transparent 60%)',
                    pointerEvents: 'none',
                }}
            />

            {/* Content Buffer */}
            <div style={{ position: 'relative', zIndex: 1 }}>
                {children}
            </div>
        </motion.div>
    );
}
