'use client';

import { useState, useEffect } from 'react';
import ProgressDisplay, { ProcessingStage } from '@/components/ProgressDisplay';

export default function TestLoaderPage() {
    const [stage, setStage] = useState<ProcessingStage>('idle');
    const [progress, setProgress] = useState(0);

    const startSimulation = () => {
        setStage('processing');
        setProgress(0);

        // Simulate "steppy" backend updates
        setTimeout(() => {
            console.log('Backend update: 30%');
            setProgress(30);
        }, 2000); // Wait 2s, then jump to 30

        setTimeout(() => {
            console.log('Backend update: 50%');
            setProgress(50);
        }, 8000); // Wait another 6s, then jump to 50

        setTimeout(() => {
            console.log('Backend update: 80%');
            setProgress(80);
        }, 14000); // Wait another 6s, then jump to 80

        setTimeout(() => {
            console.log('Backend update: 100%');
            setProgress(100);
            setStage('complete');
        }, 18000); // Finish
    };

    return (
        <div style={{ padding: '50px', maxWidth: '600px', margin: '0 auto', color: 'white' }}>
            <h1>Smooth Loader Test</h1>
            <p style={{ marginBottom: '20px', color: '#ccc' }}>
                Click start to simulate a "steppy" backend job (0 -&gt; 30 -&gt; 50 -&gt; 80 -&gt; 100).
                <br />
                Watch if the progress bar moves smoothly between these steps.
            </p>

            <button
                onClick={startSimulation}
                style={{
                    padding: '10px 20px',
                    background: '#00D9FF',
                    border: 'none',
                    borderRadius: '5px',
                    marginBottom: '30px',
                    cursor: 'pointer'
                }}
            >
                Start Simulation
            </button>

            <ProgressDisplay
                stage={stage}
                progress={progress}
                estimatedTime="Calculating..."
                fileName="test-video.mp4"
                fileSize="50 MB"
            />
        </div>
    );
}
