import { MetadataRoute } from 'next';

export default function sitemap(): MetadataRoute.Sitemap {
    const baseUrl = 'https://magetool.in';
    const currentDate = new Date();

    // All tools with SEO-optimized data
    const tools = [
        // ============ HOME ============
        { path: '', priority: 1.0 },

        // ============ IMAGE TOOLS (24) ============
        { path: '/images', priority: 0.9 },
        { path: '/images/converter', priority: 0.95 },          // "png to jpg", "image converter"
        { path: '/images/background-remover', priority: 0.95 }, // "remove background"
        { path: '/images/editor', priority: 0.9 },              // "image editor online"
        { path: '/images/qr-factory', priority: 0.9 },          // "qr code generator"
        { path: '/images/collage', priority: 0.85 },            // "photo collage maker"
        { path: '/images/resizer', priority: 0.85 },            // "image resizer"
        { path: '/images/cropper', priority: 0.85 },            // "image cropper"
        { path: '/images/upscaler', priority: 0.9 },            // "image upscaler"
        { path: '/images/passport-photo', priority: 0.85 },     // "passport photo maker"
        { path: '/images/ocr', priority: 0.85 },                // "image to text ocr"
        { path: '/images/watermark-add', priority: 0.8 },       // "add watermark"
        { path: '/images/watermark-remove', priority: 0.8 },    // "remove watermark"
        { path: '/images/meme-generator', priority: 0.8 },      // "meme generator"
        { path: '/images/color-palette', priority: 0.8 },       // "color palette generator"
        { path: '/images/svg-converter', priority: 0.85 },      // "svg to png"
        { path: '/images/favicon', priority: 0.8 },             // "favicon generator"
        { path: '/images/images-to-pdf', priority: 0.85 },      // "images to pdf"
        { path: '/images/splitter', priority: 0.8 },            // "split image"
        { path: '/images/negative', priority: 0.75 },           // "negative image"
        { path: '/images/blur-face', priority: 0.8 },           // "blur face in photo"
        { path: '/images/exif-scrubber', priority: 0.75 },      // "remove exif data"
        { path: '/images/ai-checker', priority: 0.8 },          // "ai image detector"
        { path: '/images/design-studio', priority: 0.8 },       // "design studio"
        { path: '/images/size-adjuster', priority: 0.8 },       // "image size adjuster"

        // ============ DOCUMENT TOOLS (12) ============
        { path: '/documents', priority: 0.9 },
        { path: '/documents/converter', priority: 0.95 },       // "pdf to word", "word to pdf"
        { path: '/documents/pdf-merge', priority: 0.95 },       // "merge pdf", "combine pdf"
        { path: '/documents/pdf-split', priority: 0.95 },       // "split pdf"
        { path: '/documents/pdf-compress', priority: 0.9 },     // "compress pdf"
        { path: '/documents/pdf-protect', priority: 0.85 },     // "password protect pdf"
        { path: '/documents/pdf-unlock', priority: 0.85 },      // "unlock pdf"
        { path: '/documents/to-image', priority: 0.85 },        // "pdf to image"
        { path: '/documents/text-editor', priority: 0.8 },      // "text editor online"
        { path: '/documents/data-convert', priority: 0.8 },     // "json to csv"
        { path: '/documents/metadata', priority: 0.75 },        // "pdf metadata editor"
        { path: '/documents/hash-verifier', priority: 0.75 },   // "hash verifier"
        { path: '/documents/size-adjuster', priority: 0.8 },    // "document size adjuster"
        { path: '/documents/ppt-watermark-remove', priority: 0.85 }, // "remove watermark ppt"

        // ============ VIDEO TOOLS (13) ============
        { path: '/videos', priority: 0.9 },
        { path: '/videos/converter', priority: 0.95 },          // "video converter"
        { path: '/videos/compressor', priority: 0.9 },          // "compress video"
        { path: '/videos/trimmer', priority: 0.85 },            // "trim video"
        { path: '/videos/merger', priority: 0.85 },             // "merge videos"
        { path: '/videos/to-gif', priority: 0.85 },             // "video to gif"
        { path: '/videos/to-frames', priority: 0.8 },           // "video to frames"
        { path: '/videos/extract-audio', priority: 0.85 },      // "extract audio from video"
        { path: '/videos/add-music', priority: 0.8 },           // "add music to video"
        { path: '/videos/mute', priority: 0.75 },               // "mute video"
        { path: '/videos/rotate', priority: 0.75 },             // "rotate video"
        { path: '/videos/speed', priority: 0.8 },               // "change video speed"
        { path: '/videos/metadata', priority: 0.7 },            // "video metadata"
        { path: '/videos/ai-finder', priority: 0.8 },           // "find video source"

        // ============ AUDIO TOOLS (5) ============
        { path: '/audio', priority: 0.85 },
        { path: '/audio/converter', priority: 0.9 },            // "audio converter"
        { path: '/audio/trimmer', priority: 0.85 },             // "audio trimmer"
        { path: '/audio/volume', priority: 0.8 },               // "change audio volume"
        { path: '/audio/bpm', priority: 0.75 },                 // "bpm counter"
        { path: '/audio/identify', priority: 0.8 },             // "identify song"

        // ============ LEGAL PAGES ============
        { path: '/privacy', priority: 0.3 },
        { path: '/terms', priority: 0.3 },
        { path: '/support', priority: 0.5 },
    ];

    return tools.map((tool) => ({
        url: `${baseUrl}${tool.path}`,
        lastModified: currentDate,
        changeFrequency: tool.path === '' ? 'daily' : 'weekly' as const,
        priority: tool.priority,
    }));
}
