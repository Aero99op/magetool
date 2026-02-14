export const documentTools = {
    'pdf-compress': {
        title: "Compress PDF Online",
        description: "Reduce PDF file size while maintaining quality. optimize documents for email attachments and web upload.",
        features: [
            "Compress PDF by up to 90%",
            "Adjustable compression levels (Extreme, Recommended, Less)",
            "Batch compression",
            "Preserve text quality"
        ],
        benefits: [
            { title: "Email Friendly", description: "Send large reports via email without bouncing." }
        ],
        howTo: [
            { title: "Upload PDF", description: "Select file." },
            { title: "Choose Level", description: "Select compression strength." },
            { title: "Download", description: "Get your optimized PDF." }
        ],
        faqs: []
    },
    'pdf-merge': {
        title: "Merge PDF Files",
        description: "Combine multiple PDFs into one document. Reorder pages and merge invoices, reports, or ebooks.",
        features: [
            "Merge unlimited files",
            "Drag and drop reordering",
            "Reliable and secure"
        ],
        benefits: [
            { title: "Organize Files", description: "Keep related documents together in one file." }
        ],
        howTo: [
            { title: "Select PDFs", description: "Upload multiple files." },
            { title: "Order", description: "Arrange them in the correct sequence." },
            { title: "Merge", description: "Download the single PDF." }
        ],
        faqs: []
    },
    'pdf-split': {
        title: "Split PDF Pages",
        description: "Extract specific pages from a PDF or split a document into multiple files.",
        features: [
            "Extract by page range (e.g., 1-5)",
            "Split every page into separate file",
            "Instant processing"
        ],
        benefits: [
            { title: "Extract Information", description: "Pull out just the invoice page from a long contract." }
        ],
        howTo: [
            { title: "Upload", description: "Select PDF." },
            { title: "Select Mode", description: "Choose 'Split by Range' or 'Extract all'." },
            { title: "Download", description: "Get your separated files." }
        ],
        faqs: []
    },
    'pdf-protect': {
        title: "Protect PDF with Password",
        description: "Encrypt your PDF with a strong password. Prevent unauthorized access to sensitive documents.",
        features: [
            "AES-128 encryption",
            "Set owner and user passwords",
            "Restrict printing/copying (optional)"
        ],
        benefits: [
            { title: "Secure Data", description: "Ensure only the recipient can open the file." }
        ],
        howTo: [
            { title: "Upload", description: "Select PDF." },
            { title: "Set Password", description: "Enter a strong password." },
            { title: "Encrypt", description: "Download the locked file." }
        ],
        faqs: []
    },
    'pdf-unlock': {
        title: "Unlock PDF Password",
        description: "Remove password security from PDF files (if you know the password). Decrypt documents for easier editing.",
        features: [
            "Instant decryption",
            "Remove print/copy restrictions",
            "Client-side safe processing"
        ],
        benefits: [
            { title: "Remove Annoyance", description: "Stop typing the password every time you open the bank statement." }
        ],
        howTo: [
            { title: "Upload", description: "Select locked PDF." },
            { title: "Enter Password", description: "Provide the current password to unlock." },
            { title: "Unlock", description: "Download the unprotected version." }
        ],
        faqs: []
    },
    'pdf-converter': {
        title: "PDF Converter",
        description: "Convert PDFs to Word, Excel, PowerPoint, or Image formats. And vice versa.",
        features: [
            "PDF to Word/Docx",
            "PDF to JPG/PNG",
            "Word to PDF",
            "High fidelity conversion"
        ],
        benefits: [
            { title: "Edit Content", description: "Turn non-editable PDFs into editable Word docs." }
        ],
        howTo: [
            { title: "Upload", description: "Select file." },
            { title: "Select Format", description: "Choose target format." },
            { title: "Convert", description: "Download converted file." }
        ],
        faqs: []
    },
    'pdf-metadata': {
        title: "Edit PDF Metadata",
        description: "Change PDF title, author, subject, and keywords. seamless metadata editor.",
        features: [
            "View current metadata",
            "Modify Title, Author, Creator",
            "Add Keywords for SEO"
        ],
        benefits: [
            { title: "Professionalism", description: "Clean up messy metadata before sending to clients." }
        ],
        howTo: [
            { title: "Upload", description: "Select PDF." },
            { title: "Edit", description: "Type new values." },
            { title: "Save", description: "Download updated PDF." }
        ],
        faqs: []
    },
    'document-size-adjuster': {
        title: "Resize Document",
        description: "Adjust the paper size of your PDF document (e.g., A4 to Letter). Scale content to fit.",
        features: [
            "Standard sizes (A4, A3, Letter, Legal)",
            "Scale content or add margins",
            "Preview layout"
        ],
        benefits: [
            { title: "Print Ready", description: "Ensure your document prints correctly on different paper sizes." }
        ],
        howTo: [
            { title: "Upload", description: "Select PDF." },
            { title: "Select Size", description: "Choose target paper size." },
            { title: "Resize", description: "Download formatted PDF." }
        ],
        faqs: []
    },
    'document-data-converter': {
        title: "Data Converter",
        description: "Convert data between JSON, CSV, and XML formats. Essential tool for developers and data analysts.",
        features: [
            "JSON to CSV/XML",
            "CSV to JSON/XML",
            "XML to JSON/CSV",
            "Beautify and Minify output"
        ],
        benefits: [
            { title: "Interoperability", description: "Make your data compatible with any system." }
        ],
        howTo: [
            { title: "Upload/Paste", description: "Input your data." },
            { title: "Select Format", description: "Choose output format." },
            { title: "Convert", description: "Get formatted data." }
        ],
        faqs: []
    },
    'document-hash-verifier': {
        title: "File Hash Verifier",
        description: "Calculate SHA256, MD5, SHA1 hashes of any file to verify its integrity. 100% client-side security.",
        features: [
            "Supports MD5, SHA1, SHA256",
            "Compare with expected hash",
            "Works with large files"
        ],
        benefits: [
            { title: "Security Check", description: "Ensure your downloaded files haven't been tampered with." }
        ],
        howTo: [
            { title: "Select File", description: "Choose file to check." },
            { title: "Calculate", description: "View generated hashes." },
            { title: "Compare", description: "Paste expected hash to verify." }
        ],
        faqs: []
    },
    'document-text-editor': {
        title: "Online Text Editor",
        description: "Distraction-free text and code editor. Edit TXT, JSON, MD, and code files directly in your browser.",
        features: [
            "Syntax highlighting",
            "Line numbers & Word count",
            "Auto-save to local storage",
            "Download as file"
        ],
        benefits: [
            { title: "Quick Edits", description: "Edit config files or notes without opening heavy IDEs." }
        ],
        howTo: [
            { title: "Start Typing", description: "Or upload a file." },
            { title: "Edit", description: "Use the clean interface." },
            { title: "Save", description: "Download your work." }
        ],
        faqs: []
    },
    'document-pdf-to-image': {
        title: "PDF to Image",
        description: "Convert PDF pages into high-quality images (JPG, PNG, WebP).",
        features: [
            "Convert all pages or specific range",
            "High resolution output",
            "Zip download for multiple files"
        ],
        benefits: [
            { title: "Visual Sharing", description: "Share PDF content on social media as images." }
        ],
        howTo: [
            { title: "Upload PDF", description: "Select file." },
            { title: "Choose Format", description: "JPG, PNG, or WebP." },
            { title: "Convert", description: "Download images." }
        ],
        faqs: []
    },
    'structure-visualizer': {
        title: "Structure Visualizer",
        description: "Turn text, JSON, or ideas into visual diagrams instantly. Create Tree views, Mindmaps, Flowcharts, and more from simple text.",
        features: [
            "Support for 20+ Diagram Types",
            "Auto-detects indentation structure",
            "JSON to Class/Object Diagram",
            "Export to SVG/PNG"
        ],
        benefits: [
            { title: "Visualize Ideas", description: "Instantly see the structure of your thoughts or code." }
        ],
        howTo: [
            { title: "Input Text", description: "Paste indented text or JSON." },
            { title: "Select Type", description: "Choose from Tree, Mindmap, Pie, etc." },
            { title: "Visualize", description: "See the result instantly." }
        ],
        faqs: []
    }
};
