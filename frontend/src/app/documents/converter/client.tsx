'use client';

import { useState, useCallback } from 'react';
import ToolLayout from '@/components/ToolLayout';
import { ProcessingStage } from '@/components/ProgressDisplay';
import { documentApi, getDownloadUrl, pollTaskStatus, formatFileSize, startProcessing } from '@/lib/api';
import ToolContent from '@/components/ToolContent';

const OUTPUT_FORMATS = [
    { value: 'pdf', label: 'PDF (.pdf)' },
    { value: 'docx', label: 'Word (.docx)' },
    { value: 'txt', label: 'Text (.txt)' },
    { value: 'json', label: 'JSON (.json)' },
    { value: 'csv', label: 'CSV (.csv)' },
    { value: 'xml', label: 'XML (.xml)' },
];

const ACCEPT_FORMATS = {
    'application/*': ['.pdf', '.docx', '.doc', '.txt', '.json', '.csv', '.xml', '.xlsx', '.xls', '.md', '.rtf'],
    'text/*': ['.txt', '.json', '.csv', '.xml', '.md'],
};

export default function DocumentConverterClient() {
    const [outputFormat, setOutputFormat] = useState('pdf');
    const [stage, setStage] = useState<ProcessingStage>('idle');
    const [progress, setProgress] = useState(0);
    const [uploadSpeed, setUploadSpeed] = useState<string>();
    const [fileName, setFileName] = useState<string>();
    const [fileSize, setFileSize] = useState<string>();
    const [errorMessage, setErrorMessage] = useState<string>();
    const [downloadReady, setDownloadReady] = useState(false);
    const [downloadUrl, setDownloadUrl] = useState<string>();
    const [downloadFileName, setDownloadFileName] = useState<string>();
    const [downloadFileSize, setDownloadFileSize] = useState<string>();
    const [taskId, setTaskId] = useState<string | null>(null);

    const handleFilesSelected = useCallback(async (files: File[]) => {
        if (files.length === 0) return;
        const file = files[0];
        setFileName(file.name);
        setFileSize(formatFileSize(file.size));
        setStage('uploading');
        setProgress(0);
        setDownloadReady(false);

        try {
            let lastLoaded = 0, lastTime = Date.now();
            const response = await documentApi.convert(file, outputFormat, (e) => {
                if (e.total) {
                    setProgress(Math.round((e.loaded / e.total) * 100));
                    const now = Date.now(), timeDiff = (now - lastTime) / 1000;
                    if (timeDiff > 0.5) {
                        setUploadSpeed(`${((e.loaded - lastLoaded) / timeDiff / 1024 / 1024).toFixed(1)} MB/s`);
                        lastLoaded = e.loaded; lastTime = now;
                    }
                }
            });
            setTaskId(response.task_id);
            setStage('uploaded');
        } catch (error: any) {
            setStage('error');
            setErrorMessage(error.message || 'Upload failed');
        }
    }, [outputFormat]);

    const handleProcess = useCallback(async () => {
        if (!taskId) return;
        setStage('processing');
        try {
            await startProcessing(taskId);
            const completedTask = await pollTaskStatus(taskId, (t) => setProgress(t.progress_percent || 0));
            setStage('complete');
            setDownloadReady(true);
            setDownloadUrl(getDownloadUrl(taskId));
            setDownloadFileName(completedTask.output_filename || `converted.${outputFormat}`);
            if (completedTask.file_size) setDownloadFileSize(formatFileSize(completedTask.file_size));
        } catch (error: any) {
            setStage('error');
            setErrorMessage(error.message || 'Conversion failed');
        }
    }, [taskId, outputFormat]);

    return (
        <ToolLayout
            title="Document Converter"
            subtitle="Convert documents between PDF, Word, TXT, and more"
            acceptFormats={ACCEPT_FORMATS}
            maxFileSize={50}
            maxFiles={1}
            supportedFormatsText="Supported: PDF, DOCX, TXT, JSON, CSV, XML | Max: 50MB"
            onFilesSelected={handleFilesSelected}
            onProcessClick={handleProcess}
            configPanel={
                <div>
                    <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.875rem', color: 'var(--text-secondary)' }}>Output Format</label>
                    <select value={outputFormat} onChange={(e) => setOutputFormat(e.target.value)} style={{ width: '100%', padding: '12px 16px', background: 'var(--glass-bg-hover)', border: '1px solid var(--glass-border)', borderRadius: '8px', color: 'var(--text-primary)' }}>
                        {OUTPUT_FORMATS.map((f) => <option key={f.value} value={f.value}>{f.label}</option>)}
                    </select>
                    {stage !== 'idle' && <button onClick={() => { setStage('idle'); setDownloadReady(false); }} className="btn btn-ghost" style={{ width: '100%', marginTop: '20px' }}>Convert Another</button>}
                </div>
            }
            processingStage={stage}
            progress={progress}
            uploadSpeed={uploadSpeed}
            fileName={fileName}
            fileSize={fileSize}
            errorMessage={errorMessage}
            downloadReady={downloadReady}
            downloadUrl={downloadUrl}
            downloadFileName={downloadFileName}
            downloadFileSize={downloadFileSize}
            toolContent={<ToolContent overview="Convert documents between formats. PDF to Word, DOCX to PDF, and more." features={["Multi-Format: PDF, DOCX, TXT, JSON, CSV, XML.", "Fast Conversion: Process in seconds.", "Privacy First: Files auto-deleted.", "No Signup: Instant access."]} howTo={[{ step: "Upload Document", description: "Select file to convert." }, { step: "Choose Format", description: "Select output format." }, { step: "Convert", description: "Process the conversion." }, { step: "Download", description: "Save converted file." }]} />}
        />
    );
}
