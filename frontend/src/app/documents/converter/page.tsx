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

export default function DocumentConverterPage() {
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
        setErrorMessage(undefined);
        setDownloadReady(false);

        try {
            let lastLoaded = 0;
            let lastTime = Date.now();

            const response = await documentApi.convert(
                file,
                outputFormat,
                (progressEvent) => {
                    if (progressEvent.total) {
                        const percent = Math.round((progressEvent.loaded / progressEvent.total) * 100);
                        setProgress(percent);

                        const now = Date.now();
                        const timeDiff = (now - lastTime) / 1000;
                        if (timeDiff > 0.5) {
                            const bytesDiff = progressEvent.loaded - lastLoaded;
                            const speed = bytesDiff / timeDiff / (1024 * 1024);
                            setUploadSpeed(`${speed.toFixed(1)} MB/s`);
                            lastLoaded = progressEvent.loaded;
                            lastTime = now;
                        }
                    }
                }
            );

            setTaskId(response.task_id);
            setStage('uploaded');
            setProgress(100);

        } catch (error: any) {
            console.error('Upload error:', error);
            setStage('error');
            setErrorMessage(error.message || 'Upload failed. Please try again.');
        }
    }, [outputFormat]);

    const handleProcess = useCallback(async () => {
        if (!taskId) return;

        setStage('processing');
        setProgress(0);

        try {
            await startProcessing(taskId);
            const completedTask = await pollTaskStatus(
                taskId,
                (task) => {
                    setProgress(task.progress_percent || 0);
                }
            );

            setStage('complete');
            setDownloadReady(true);
            setDownloadUrl(getDownloadUrl(taskId));
            setDownloadFileName(completedTask.output_filename || `converted.${outputFormat}`);
            if (completedTask.file_size) {
                setDownloadFileSize(formatFileSize(completedTask.file_size));
            }

        } catch (error: any) {
            console.error('Processing error:', error);
            setStage('error');
            setErrorMessage(error.message || 'Processing failed. Please try again.');
        }
    }, [taskId, outputFormat]);

    const resetState = () => {
        setStage('idle');
        setProgress(0);
        setDownloadReady(false);
        setErrorMessage(undefined);
        setTaskId(null);
    };

    const toolContent = (
        <ToolContent
            overview="Our free online Document Converter is the ultimate definition of versatility when it comes to file transformation. Whether you need to convert a PDF to an editable Word document, extract data from a JSON file into a CSV spreadsheet, or simply switch between text formats, this tool handles it all with precision. Designed for both casual users and developers, it supports a wide range of formats including PDF, DOCX, TXT, JSON, CSV, and XML. The conversion process preserves the structure and formatting of your original files, ensuring that your data remains intact and usable."
            features={[
                "Universal Format Support: Convert between PDF, DOCX, TXT, JSON, CSV, and XML seamlessly.",
                "Accurate Data Extraction: Smart parsing algorithms ensure tables in PDFs and keys in JSONs are converted correctly.",
                "Developer Friendly: specialized support for JSON <-> CSV and XML conversions for data manipulation.",
                "Secure Processing: All files are processed on secure servers and deleted automatically after 1 hour.",
                "Batch Ready: Designed to handle large files (up to 50MB) with ease.",
                "No Installation Required: Works entirely in your browser, on any device."
            ]}
            howTo={[
                { step: "Upload your Document", description: "Click the upload area or drag and drop your file (PDF, DOCX, JSON, etc.) into the box." },
                { step: "Select Output Format", description: "Choose your desired target format from the dropdown menu (e.g., 'JSON to CSV')." },
                { step: "Convert", description: "Click the 'Convert' button to start the transformation process." },
                { step: "Download", description: "Once finished, click 'Download' to save your new file immediately." }
            ]}
        />
    );

    return (
        <ToolLayout
            title="Document Converter"
            subtitle="Convert documents between PDF, DOCX, TXT, JSON, CSV, and XML formats"
            acceptFormats={ACCEPT_FORMATS}
            maxFileSize={50}
            maxFiles={1}
            supportedFormatsText="Supported: PDF, DOCX, TXT, JSON, CSV, XML, XLSX | Max: 50MB"
            onFilesSelected={handleFilesSelected}
            onProcessClick={handleProcess}
            toolContent={toolContent}
            configPanel={
                <div>
                    <div style={{ marginBottom: '20px' }}>
                        <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
                            Output Format
                        </label>
                        <select
                            value={outputFormat}
                            onChange={(e) => setOutputFormat(e.target.value)}
                            style={{
                                width: '100%',
                                padding: '12px 16px',
                                background: 'rgba(255, 255, 255, 0.05)',
                                border: '1px solid var(--glass-border)',
                                borderRadius: '8px',
                                color: 'var(--text-primary)',
                                fontSize: '1rem',
                            }}
                        >
                            {OUTPUT_FORMATS.map((format) => (
                                <option key={format.value} value={format.value}>{format.label}</option>
                            ))}
                        </select>
                    </div>

                    <div style={{ padding: '12px', background: 'rgba(0, 217, 255, 0.05)', borderRadius: '8px', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                        <strong style={{ color: 'var(--neon-blue)' }}>Supported Conversions:</strong>
                        <ul style={{ margin: '8px 0 0 16px', lineHeight: 1.6 }}>
                            <li>JSON ↔ CSV</li>
                            <li>CSV ↔ JSON</li>
                            <li>TXT ↔ JSON</li>
                        </ul>
                    </div>

                    {stage !== 'idle' && (
                        <button onClick={resetState} className="btn btn-ghost" style={{ width: '100%', marginTop: '16px' }}>
                            Convert Another
                        </button>
                    )}
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
        />
    );
}
