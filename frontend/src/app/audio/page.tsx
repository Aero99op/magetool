import type { Metadata } from 'next';
import AudioPageClient from './client';

export const metadata: Metadata = {
    title: 'Free Online Audio Tools - Converter, Trimmer, Volume Booster - Magetool',
    description: 'Magetool Audio Suite: Free online audio converter and editor. Convert MP3, trim audio, boost volume, and detect BPM. No software required.',
    keywords: ['audio tools', 'mp3 converter', 'audio trimmer', 'volume booster', 'bpm detector', 'magetool audio', 'free audio editor'],
    openGraph: {
        title: 'Magetool Audio Studio - Free Online Audio Tools',
        description: 'Convert and edit audio files online for free. MP3 converter, trimmer, and AI song identifier.',
    },
};

export default function AudioPage() {
    return <AudioPageClient />;
}
