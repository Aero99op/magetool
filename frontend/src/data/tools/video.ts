export const videoTools = {
    'video-converter': {
        title: "The Ultimate Free Online Video Converter",
        description: `
            Magetool's Video Converter is a powerful, privacy-focused tool that lets you convert videos between formats like MP4, MKV, AVI, MOV, and WebM directly in your browser. 
            Unlike other online converters, we do not upload your files to a remote server. Everything happens on your device using advanced WebAssembly technology, ensuring 100% privacy and lightning-fast speeds.
            Whether you need to compress a video for WhatsApp, convert an MKV movie to play on your TV, or turn a MOV file into a web-friendly WebM, Magetool has you covered.
        `,
        features: [
            "Convert between MP4, MKV, AVI, MOV, WebM, and more.",
            "Client-side processing: Your files never leave your computer.",
            "No file size limits (convert 1GB+ files easily).",
            "Batch conversion support.",
            "Adjust video resolution and quality.",
            "Completely free to use with no watermarks."
        ],
        benefits: [
            {
                title: "100% Privacy Guaranteed",
                description: "Since we don't upload your files to the cloud, there is zero risk of your personal videos being leaked or accessed by third parties."
            },
            {
                title: "Blazing Fast Speeds",
                description: "By utilizing your computer's processing power, we eliminate the need to wait for slow uploads and downloads. Conversion starts instantly."
            },
            {
                title: "Professional Quality",
                description: "We use FFmpeg, the industry-standard multimedia framework, to ensure your converted videos retain the highest possible quality."
            }
        ],
        howTo: [
            {
                title: "Upload Your Video",
                description: "Click the 'Select Files' button or drag and drop your video file into the designated area. We support all major video formats."
            },
            {
                title: "Choose Output Format",
                description: "Select your desired output format (e.g., MP4) from the dropdown format list. You can also adjust resolution settings if needed."
            },
            {
                title: "Start Conversion",
                description: "Hit the 'Convert' button. The tool will process your video locally. Once done, click 'Download' to save your new file instantly."
            }
        ],
        faqs: [
            {
                question: "Is this video converter really free?",
                answer: "Yes, Magetool is 100% free to use. We don't charge for conversions, and there are no hidden paywalls or premium-only features."
            },
            {
                question: "Is it safe to convert private videos here?",
                answer: "Absolutely. Unlike other sites, we process files locally in your browser. Your video data never travels over the internet, making it physically impossible for us to see or store your files."
            },
            {
                question: "Can I convert videos on my phone?",
                answer: "Yes! Magetool works perfectly on modern mobile browsers (Chrome, Safari, Firefox) on both Android and iOS devices."
            },
            {
                question: "What is the maximum file size limit?",
                answer: "Technically, there is no hard limit imposed by us since processing is local. However, very large files (2GB+) may be slower depending on your device's RAM and processing power."
            }
        ]
    },
    'video-compressor': {
        title: "Free Online Video Compressor",
        description: "Reduce video file size without losing quality. Magetool's intelligent compression algorithm optimizes your videos for WhatsApp, Email, Instagram, and Discord directly in your browser.",
        features: [
            "Reduce file size by up to 80%",
            "Adjustable compression levels (Low, Medium, High)",
            "Supports MP4, MOV, MKV, AVI",
            "No upload limits - process 1GB+ videos instantly",
            "100% Privacy - Files never leave your device"
        ],
        benefits: [
            { title: "Save Storage Space", description: "Free up space on your phone or computer by compressing large video files." },
            { title: "Faster Sharing", description: "Send videos quickly over WhatsApp or Email without hitting attachment limits." },
            { title: "Local Processing", description: "No waiting for uploads. Compression happens instantly on your device." }
        ],
        howTo: [
            { title: "Select Video", description: "Drag and drop your video file." },
            { title: "Choose Quality", description: "Select your desired compression level. 'Medium' is recommended for a balance of size and quality." },
            { title: "Compress & Download", description: "Click compress and save your smaller video file instantly." }
        ],
        faqs: [
            { question: "Will I lose quality?", answer: "Our smart algorithm removes invisible data first. Visible quality loss is minimal at 'Medium' settings." },
            { question: "Is there a file size limit?", answer: "No! Since we process locally, you can compress 4GB files if your device can handle it." }
        ]
    },
    'video-trimmer': {
        title: "Cut & Trim Videos Online",
        description: "Remove unwanted parts from your videos easily. Select start and end points and save the perfect clip in seconds.",
        features: [
            "Precise frame-by-frame trimming",
            "Instant preview",
            "No watermarks",
            "Export in original quality",
            "Works on Mobile and Desktop"
        ],
        benefits: [
            { title: "Show Highlights", description: "Keep only the best moments of your video." },
            { title: "Remove Mistakes", description: "Cut out the shaky start or the awkward ending." },
            { title: "Social Ready", description: "Trim lengthy videos to fit 15s/60s limits for Stories and Reels." }
        ],
        howTo: [
            { title: "Upload Video", description: "Load the video you want to trim." },
            { title: "Set Range", description: "Drag the sliders to mark the start and end points." },
            { title: "Trim Video", description: "Click 'Trim' to generate your new clip instantly." }
        ],
        faqs: [
            { question: "Does it re-encode the video?", answer: "We try to stream copy where possible for instant cutting, otherwise we re-encode rapidly." }
        ]
    },
    'video-to-frames': {
        title: "Extract Frames from Video",
        description: "Turn any video into a sequence of high-quality images. Perfect for finding that one perfect shot or analyzing motion.",
        features: [
            "Extract every frame or every Nth frame",
            "Save as JPG or PNG",
            "Download all frames as a ZIP file",
            "Play unblocked mini-games while waiting!"
        ],
        benefits: [
            { title: "Find the Perfect Shot", description: "Never miss a moment. Extract thousands of photos from a single video." },
            { title: "Motion Analysis", description: "Break down fast movements frame by frame." }
        ],
        howTo: [
            { title: "Upload Video", description: "Choose your video file." },
            { title: "Configure Extraction", description: "Choose frames per second (FPS) or total frames to extract." },
            { title: "Download Images", description: "Download individual frames or a ZIP of all images." }
        ],
        faqs: [
            { question: "How many frames can I extract?", answer: "Unlimited! But be careful, a 1-minute video at 60fps is 3,600 images." }
        ]
    },
    'video-to-gif': {
        title: "Video to GIF Converter",
        description: "Create animated GIFs from your videos. Perfect for memes, reactions, and social media sharing.",
        features: [
            "Custom start and end time",
            "Adjust FPS and Resolution",
            "Optimized for small file size",
            "No watermark"
        ],
        benefits: [
            { title: "Make Memes", description: "Fastest way to create high-quality GIFs for Twitter and Discord." },
            { title: "Embed Anywhere", description: "GIFs play automatically on almost all websites." }
        ],
        howTo: [
            { title: "Upload Clip", description: "Select a short video clip." },
            { title: "Trim", description: "Select the part you want to loop." },
            { title: "Convert to GIF", description: "Click convert and download your animation." }
        ],
        faqs: [
            { question: "Why is the quality lower than video?", answer: "GIF format is limited to 256 colors. We use dithering to make it look as good as possible." }
        ]
    },
    'video-extract-audio': {
        title: "Extract Audio from Video",
        description: "Convert video to MP3. Extract music, speeches, or sound effects from videos in one click.",
        features: [
            "Supports MP4, MOV, MKV to MP3/AAC",
            "High bitrate support (up to 320kbps)",
            "Lightning fast processing"
        ],
        benefits: [
            { title: "Save Music", description: "Turn a music video into a song for your playlist." },
            { title: "Get Podcasts", description: "Convert video lectures or interviews into audio for listening on the go." }
        ],
        howTo: [
            { title: "Upload Video", description: "Select the video file." },
            { title: "Choose Format", description: "Select MP3 or AAC." },
            { title: "Extract", description: "Download your audio file instantly." }
        ],
        faqs: [
            { question: "Is it legal?", answer: "You can convert content you own or have permission to use." }
        ]
    },
    'video-mute': {
        title: "Remove Audio from Video",
        description: "Silence your video instantly. Perfect for removing background noise or copyrighted music before posting.",
        features: [
            "Complete audio removal",
            "No re-encoding required (Instant)",
            "Works with all formats"
        ],
        benefits: [
            { title: "Copyright Safety", description: "Remove risky music before uploading to YouTube/Instagram." },
            { title: "Cleanup", description: "Remove bad audio or background noise." }
        ],
        howTo: [
            { title: "Upload", description: "Select video." },
            { title: "Mute", description: "Click 'Remove Audio'." },
            { title: "Download", description: "Save your silent video." }
        ],
        faqs: [
            { question: "Does video quality change?", answer: "No! We just remove the audio track. The video remains exactly the same quality." }
        ]
    },
    'video-rotate': {
        title: "Rotate Video Online",
        description: "Fix sideways or upside-down videos. Rotate 90, 180, or 270 degrees easily.",
        features: [
            "Rotate 90 degrees clockwise/counter-clockwise",
            "Flip horizontally or vertically",
            "Preview changes instantly"
        ],
        benefits: [
            { title: "Fix Phone Videos", description: "Correct orientation for videos taken on mobile." }
        ],
        howTo: [
            { title: "Upload", description: "Select video." },
            { title: "Rotate", description: "Use buttons to rotate or flip." },
            { title: "Save", description: "Download the corrected video." }
        ],
        faqs: []
    },
    'video-speed': {
        title: "Change Video Speed",
        description: "Make slomo or timelapse videos. Speed up or slow down your footage.",
        features: [
            "Speed up (2x, 4x, 8x)",
            "Slow down (0.5x, 0.25x)",
            "Keep audio pitch option"
        ],
        benefits: [
            { title: "Create Effects", description: "Make dramatic slow-motion scenes." },
            { title: "Save Time", description: "Watch lectures or tutorials at 2x speed." }
        ],
        howTo: [
            { title: "Upload", description: "Select video." },
            { title: "Set Speed", description: "Choose multiplier (e.g., 2.0x)." },
            { title: "Process", description: "Download the retimed video." }
        ],
        faqs: []
    },
    'video-merger': {
        title: "Merge Videos Online",
        description: "Combine multiple video clips into one file. Join parts together seamlessly.",
        features: [
            "Join unlimited clips",
            "Rearrange order via drag and drop",
            "Supports different formats"
        ],
        benefits: [
            { title: "Make Compilations", description: "Combine your best clips into a highlight reel." }
        ],
        howTo: [
            { title: "Upload Files", description: "Select multiple video files." },
            { title: "Arrange", description: "Drag and drop to set the order." },
            { title: "Merge", description: "Click merge and download one single video." }
        ],
        faqs: []
    },
    'video-add-music': {
        title: "Add Music to Video",
        description: "Mix audio with your video. Replace background noise with a soundtrack.",
        features: [
            "Add MP3/WAV to video",
            "Adjust volume balance",
            "Trim audio to fit video"
        ],
        benefits: [
            { title: "Enhance Content", description: "Background music makes videos 10x more engaging." }
        ],
        howTo: [
            { title: "Upload Video", description: "Select video file." },
            { title: "Upload Audio", description: "Select music file." },
            { title: "Mix", description: "Adjust settings and combine." }
        ],
        faqs: []
    }

};
