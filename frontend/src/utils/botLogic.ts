import { FuzzySearch } from './fuzzySearch';

export type Intent = 'GOTO_TOOL' | 'GREETING' | 'HELP' | 'QUESTION' | 'UNKNOWN';

export interface CommandAction {
    intent: Intent;
    confidence: number;
    payload?: any;
    response?: string;
}

// ============================================
// EXTENSIVE TOOL MAP WITH UNIQUE PHRASES
// ============================================
interface ToolEntry {
    path: string;
    keywords: string[];
    phrases: string[]; // EXACT phrase matches (highest priority)
    category: 'images' | 'videos' | 'documents' | 'audio';
    context?: any;
}

const TOOLS: ToolEntry[] = [
    // ===================== IMAGES =====================
    {
        path: '/images/qr-factory',
        keywords: ['qr', 'barcode', 'qrcode', 'scan', 'scanner'],
        phrases: ['qr code', 'make qr', 'create qr', 'qr generator', 'barcode maker', 'wifi qr', 'link qr', 'generate qr'],
        category: 'images'
    },
    {
        path: '/images/background-remover',
        keywords: ['background', 'bg', 'transparent', 'eraser', 'cutout', 'backdrop'],
        phrases: ['remove background', 'delete background', 'transparent background', 'bg remover', 'erase background', 'background hatao', 'remove bg'],
        category: 'images'
    },
    {
        path: '/images/blur-face',
        keywords: ['blur', 'pixelate', 'mask', 'censor'],
        phrases: ['blur face', 'hide face', 'censor face', 'pixelate face', 'face blur', 'chehra blur', 'face hide'],
        category: 'images'
    },
    {
        path: '/images/collage',
        keywords: ['collage', 'grid', 'mosaic', 'layout'],
        phrases: ['photo collage', 'image collage', 'make collage', 'combine photos', 'join photos', 'grid maker', 'photo grid'],
        category: 'images'
    },
    {
        path: '/images/color-palette',
        keywords: ['palette', 'swatch', 'hex', 'rgb'],
        phrases: ['color palette', 'extract colors', 'color picker', 'get colors', 'image colors', 'brand colors', 'color scheme'],
        category: 'images'
    },
    {
        path: '/images/converter',
        keywords: ['jpg', 'png', 'webp', 'jpeg', 'tiff', 'bmp', 'heic', 'avif'],
        phrases: ['convert image', 'image converter', 'change image format', 'jpg to png', 'png to jpg', 'webp to jpg', 'heic to jpg', 'image format'],
        category: 'images'
    },
    {
        path: '/images/cropper',
        keywords: ['crop', 'cropper'],
        phrases: ['crop image', 'image crop', 'crop photo', 'photo crop', 'cut image', 'trim image'],
        category: 'images'
    },
    {
        path: '/images/design-studio',
        keywords: ['design', 'canvas', 'graphic', 'banner', 'poster'],
        phrases: ['design studio', 'graphic design', 'create design', 'make banner', 'poster maker', 'image editor pro'],
        category: 'images'
    },
    {
        path: '/images/editor',
        keywords: ['adjust', 'filter', 'brightness', 'contrast', 'saturation', 'exposure'],
        phrases: ['quick edit', 'simple edit', 'adjust image', 'image filter', 'basic editor', 'light edit'],
        category: 'images'
    },
    {
        path: '/images/advanced-editor',
        keywords: ['edit', 'editor', 'advanced', 'pro', 'professional', 'photoshop'],
        phrases: ['photo editor', 'image editor', 'edit image', 'edit photo', 'advanced editor', 'pro editor', 'advanced photo editor', 'full editor', 'photo edit karo', 'image edit'],
        category: 'images'
    },
    {
        path: '/images/exif-scrubber',
        keywords: ['exif', 'metadata', 'gps', 'scrub'],
        phrases: ['remove exif', 'clean metadata', 'strip exif', 'remove metadata', 'exif remover', 'metadata cleaner'],
        category: 'images'
    },
    {
        path: '/images/favicon',
        keywords: ['favicon', 'ico'],
        phrases: ['favicon generator', 'create favicon', 'ico generator', 'website icon', 'browser icon', 'app icon'],
        category: 'images'
    },
    {
        path: '/images/images-to-pdf',
        keywords: [],
        phrases: ['images to pdf', 'image to pdf', 'jpg to pdf', 'png to pdf', 'photos to pdf', 'convert to pdf', 'pictures to pdf'],
        category: 'images'
    },
    {
        path: '/images/meme-generator',
        keywords: ['meme', 'funny', 'viral'],
        phrases: ['meme generator', 'make meme', 'meme maker', 'create meme', 'meme template', 'add caption'],
        category: 'images'
    },
    {
        path: '/images/negative',
        keywords: ['negative', 'invert', 'xray'],
        phrases: ['invert colors', 'negative image', 'color invert', 'xray effect', 'reverse colors'],
        category: 'images'
    },
    {
        path: '/images/ocr',
        keywords: ['ocr', 'recognize', 'digitize'],
        phrases: ['image to text', 'extract text', 'ocr scan', 'text from image', 'copy text from image', 'read image text'],
        category: 'images'
    },
    {
        path: '/images/passport-photo',
        keywords: ['passport', 'visa', 'headshot', 'id'],
        phrases: ['passport photo', 'id photo', 'visa photo', 'document photo', 'passport size', '35x45', 'id card photo'],
        category: 'images'
    },
    {
        path: '/images/resizer',
        keywords: ['resize', 'resizer', 'dimension', 'pixels'],
        phrases: ['resize image', 'image resizer', 'change size', 'change dimension', 'scale image', 'image size'],
        category: 'images'
    },
    {
        path: '/images/size-adjuster',
        keywords: ['kb', 'optimize'],
        phrases: ['compress image', 'reduce image size', 'image compressor', 'reduce image kb', 'smaller image', 'optimize image', 'image to kb'],
        category: 'images'
    },
    {
        path: '/images/splitter',
        keywords: ['splitter', 'tiles', 'pieces'],
        phrases: ['split image', 'image splitter', 'divide image', 'instagram grid', 'slice image', 'grid splitter'],
        category: 'images'
    },
    {
        path: '/images/svg-converter',
        keywords: ['svg', 'vector', 'trace'],
        phrases: ['svg converter', 'convert to svg', 'vectorize', 'image to svg', 'make vector', 'trace image'],
        category: 'images'
    },
    {
        path: '/images/upscaler',
        keywords: ['upscale', 'upscaler', 'enhance', '4k', 'hd', 'sharpen'],
        phrases: ['upscale image', 'enhance image', 'increase resolution', 'image upscaler', 'make hd', 'improve quality', 'ai upscale'],
        category: 'images'
    },
    {
        path: '/images/watermark-add',
        keywords: ['watermark', 'stamp', 'branding'],
        phrases: ['add watermark', 'watermark image', 'add logo', 'protect image', 'brand logo', 'image stamp'],
        category: 'images'
    },
    {
        path: '/images/watermark-remove',
        keywords: [],
        phrases: ['remove watermark', 'watermark remover', 'delete watermark', 'clean watermark', 'erase watermark'],
        category: 'images'
    },
    {
        path: '/images/ai-checker',
        keywords: ['deepfake', 'artificial'],
        phrases: ['ai checker', 'detect ai', 'ai detection', 'is ai', 'fake image', 'real or fake', 'ai generated'],
        category: 'images'
    },

    // ===================== VIDEOS =====================
    {
        path: '/videos/compressor',
        keywords: ['compressor', 'shrink', 'optimize', 'smaller'],
        phrases: ['compress video', 'video compressor', 'reduce video size', 'shrink video', 'make video smaller', 'video compression', 'video chota karo', 'video size kam'],
        category: 'videos'
    },
    {
        path: '/videos/converter',
        keywords: ['mp4', 'avi', 'mov', 'mkv', 'webm', 'codec', 'format'],
        phrases: ['convert video', 'video converter', 'change video format', 'video format', 'mp4 to avi', 'mkv to mp4', 'video ko convert', 'video badlo'],
        category: 'videos'
    },
    {
        path: '/videos/trimmer',
        keywords: ['trim', 'trimmer', 'clip', 'snippet', 'duration'],
        phrases: ['trim video', 'video trimmer', 'cut video', 'shorten video', 'video cut', 'video clip', 'video katna'],
        category: 'videos'
    },
    {
        path: '/videos/merger',
        keywords: ['merger', 'stitch', 'concatenate', 'append', 'compilation'],
        phrases: ['merge video', 'video merger', 'join videos', 'combine videos', 'video jodna', 'merge clips', 'join clips'],
        category: 'videos'
    },
    {
        path: '/videos/to-gif',
        keywords: ['gif', 'animated', 'loop'],
        phrases: ['video to gif', 'make gif', 'create gif', 'convert to gif', 'gif maker', 'gif from video'],
        category: 'videos'
    },
    {
        path: '/videos/to-frames',
        keywords: ['frames', 'snapshot', 'sequence', 'stills'],
        phrases: ['video to frames', 'extract frames', 'video frames', 'video to images', 'screenshots from video', 'video to jpg'],
        category: 'videos'
    },
    {
        path: '/videos/extract-audio',
        keywords: ['detach', 'separate'],
        phrases: ['extract audio', 'video to audio', 'video to mp3', 'get audio', 'audio from video', 'rip audio', 'audio nikalo'],
        category: 'videos'
    },
    {
        path: '/videos/add-music',
        keywords: ['soundtrack', 'bgm', 'dub'],
        phrases: ['add music', 'add audio', 'add song', 'music to video', 'background music', 'gaana add karo', 'video me music'],
        category: 'videos'
    },
    {
        path: '/videos/mute',
        keywords: ['mute', 'silent', 'silence', 'quiet', 'hush'],
        phrases: ['mute video', 'remove audio', 'remove sound', 'silent video', 'video mute', 'sound hatao'],
        category: 'videos'
    },
    {
        path: '/videos/rotate',
        keywords: ['rotate', 'flip', 'mirror', 'orientation'],
        phrases: ['rotate video', 'flip video', 'video rotate', 'turn video', 'mirror video', '90 degree'],
        category: 'videos'
    },
    {
        path: '/videos/speed',
        keywords: ['speed', 'tempo', 'playback', 'hyperlapse', 'timelapse', 'slo-mo'],
        phrases: ['video speed', 'slow motion', 'fast motion', 'speed up', 'slow down', 'change speed', '2x speed'],
        category: 'videos'
    },
    {
        path: '/videos/metadata',
        keywords: ['metadata', 'specs', 'bitrate', 'fps'],
        phrases: ['video metadata', 'video info', 'video details', 'video properties', 'check video'],
        category: 'videos'
    },
    {
        path: '/videos/ai-finder',
        keywords: [],
        phrases: ['ai video finder', 'detect ai video', 'video ai check', 'fake video detector'],
        category: 'videos'
    },

    // ===================== DOCUMENTS =====================
    {
        path: '/documents/converter',
        keywords: ['docx', 'doc', 'word', 'excel', 'ppt', 'office'],
        phrases: ['convert document', 'document converter', 'pdf to word', 'word to pdf', 'doc converter', 'excel to pdf', 'ppt to pdf'],
        category: 'documents',
        context: { to: 'docx' }
    },
    {
        path: '/documents/pdf-merge',
        keywords: ['bind', 'book'],
        phrases: ['merge pdf', 'combine pdf', 'join pdf', 'pdf merge', 'pdf jodo', 'multiple pdf'],
        category: 'documents'
    },
    {
        path: '/documents/pdf-split',
        keywords: ['separate', 'pages'],
        phrases: ['split pdf', 'pdf split', 'divide pdf', 'extract pages', 'separate pdf', 'pdf alag karo'],
        category: 'documents'
    },
    {
        path: '/documents/pdf-compress',
        keywords: ['lighter'],
        phrases: ['compress pdf', 'pdf compress', 'reduce pdf size', 'smaller pdf', 'pdf compressor', 'pdf chota'],
        category: 'documents'
    },
    {
        path: '/documents/pdf-protect',
        keywords: ['password', 'lock', 'secure', 'encrypt'],
        phrases: ['protect pdf', 'pdf password', 'lock pdf', 'encrypt pdf', 'secure pdf', 'pdf lock'],
        category: 'documents'
    },
    {
        path: '/documents/pdf-unlock',
        keywords: ['unlock', 'decrypt'],
        phrases: ['unlock pdf', 'pdf unlock', 'remove pdf password', 'decrypt pdf', 'open locked pdf'],
        category: 'documents'
    },
    {
        path: '/documents/to-image',
        keywords: [],
        phrases: ['pdf to image', 'pdf to jpg', 'pdf to png', 'convert pdf to image', 'pdf image'],
        category: 'documents'
    },
    {
        path: '/documents/text-editor',
        keywords: ['notepad', 'compose', 'draft', 'code', 'script'],
        phrases: ['text editor', 'write text', 'notepad online', 'simple text', 'edit text'],
        category: 'documents'
    },
    {
        path: '/documents/metadata',
        keywords: ['author', 'created', 'modified'],
        phrases: ['document metadata', 'document info', 'pdf info', 'file properties', 'doc details'],
        category: 'documents'
    },
    {
        path: '/documents/data-convert',
        keywords: ['json', 'xml', 'yaml', 'csv'],
        phrases: ['data convert', 'json to xml', 'xml to json', 'csv converter', 'yaml converter'],
        category: 'documents'
    },
    {
        path: '/documents/hash-verifier',
        keywords: ['hash', 'checksum', 'md5', 'sha', 'integrity'],
        phrases: ['hash verifier', 'file hash', 'checksum verify', 'md5 check', 'sha256'],
        category: 'documents'
    },
    {
        path: '/documents/size-adjuster',
        keywords: [],
        phrases: ['document size', 'reduce document', 'adjust document', 'document kb'],
        category: 'documents'
    },

    // ===================== AUDIO =====================
    {
        path: '/audio/converter',
        keywords: ['mp3', 'wav', 'aac', 'flac', 'ogg'],
        phrases: ['convert audio', 'audio converter', 'audio format', 'mp3 to wav', 'change audio format', 'audio badlo'],
        category: 'audio'
    },
    {
        path: '/audio/trimmer',
        keywords: ['ringtone'],
        phrases: ['trim audio', 'audio trimmer', 'cut audio', 'audio cut', 'shorten audio', 'ringtone maker', 'audio katna'],
        category: 'audio'
    },
    {
        path: '/audio/bpm',
        keywords: ['bpm', 'tempo', 'beat', 'rhythm', 'pace'],
        phrases: ['check bpm', 'find bpm', 'beat per minute', 'audio tempo', 'song bpm'],
        category: 'audio'
    },
    {
        path: '/audio/volume',
        keywords: ['volume', 'loud', 'boost', 'amplify', 'normalize'],
        phrases: ['change volume', 'audio volume', 'boost audio', 'make louder', 'increase volume', 'normalize audio'],
        category: 'audio'
    },
    {
        path: '/audio/identify',
        keywords: ['shazam', 'recognize'],
        phrases: ['identify song', 'song identifier', 'what song is this', 'find song name', 'song recognition', 'gaana pehchano'],
        category: 'audio'
    },
];

// Build phrase index for fast lookup
const PHRASE_INDEX: Map<string, ToolEntry> = new Map();
TOOLS.forEach(tool => {
    tool.phrases.forEach(phrase => {
        PHRASE_INDEX.set(phrase.toLowerCase(), tool);
    });
});

const fuse = new FuzzySearch(TOOLS, {
    keys: [
        { name: 'keywords', weight: 1 },
        { name: 'phrases', weight: 0.8 },
        { name: 'category', weight: 0.2 }
    ]
});

const RESPONSES = {
    greeting: ["Hey how can I help you?", "Hello looking for a tool?", "Hi I am ready to assist."],
    help: ["I can take you to any tool. Try 'video converter', 'compress image', 'pdf merge', or 'audio trimmer'."],
    owner: ["I was created by Spandan Prayas Patra ft. Aero. Top 0.1% Engineering due to sheer coding excellence."],
    unknown: ["Sorry, I didn't understand. Try 'convert video', 'compress pdf', or 'resize image'.", "Not sure. Try phrases like 'merge pdf', 'trim audio', or 'remove background'."],
    redirect: "Taking you to "
};

export function analyzeIntent(input: string): CommandAction {
    const lowerInput = input.toLowerCase().trim();

    // 1. Check Owner/Identity
    const ownerKeywords = ['owner', 'created', 'maker', 'who are you', 'made you', 'kisne banaya', 'kaun ho', 'tumhe kisne', 'kon banaya', 'who made'];
    if (ownerKeywords.some(k => lowerInput.includes(k))) {
        return { intent: 'QUESTION', confidence: 1.0, response: RESPONSES.owner[0] };
    }

    // 2. Greetings
    const greetings = ['hi', 'hello', 'hey', 'namaste', 'namaskar', 'greetings', 'yo', 'sup', 'hii', 'hiii', 'helo'];
    if (greetings.some(g => lowerInput === g || lowerInput.startsWith(g + ' ') || lowerInput.endsWith(' ' + g))) {
        return { intent: 'GREETING', confidence: 1.0, response: RESPONSES.greeting[Math.floor(Math.random() * RESPONSES.greeting.length)] };
    }

    // 3. Help
    const helpKeywords = ['help', 'madad', 'support', 'kya kar sakte', 'what can you do', 'kaise use', 'sahayata'];
    if (helpKeywords.some(k => lowerInput.includes(k))) {
        return { intent: 'HELP', confidence: 1.0, response: RESPONSES.help[0] };
    }

    // 4. EXACT PHRASE MATCH (HIGHEST PRIORITY)
    const phraseEntries = Array.from(PHRASE_INDEX.entries());
    for (let i = 0; i < phraseEntries.length; i++) {
        const [phrase, tool] = phraseEntries[i];
        if (lowerInput.includes(phrase)) {
            const toolName = tool.path.split('/').pop()?.replace(/-/g, ' ') || 'tool';
            return {
                intent: 'GOTO_TOOL',
                confidence: 1.0,
                response: `${RESPONSES.redirect}${toolName}...`,
                payload: { path: tool.path, context: tool.context || {} }
            };
        }
    }

    // 5. Fuzzy Search (fallback)
    const results = fuse.search(lowerInput);
    if (results.length > 0) {
        const bestMatch = results[0];
        const tool = bestMatch.item;
        const toolName = tool.path.split('/').pop()?.replace(/-/g, ' ') || 'tool';

        // Boost for exact single keyword
        let confidence = 1 - bestMatch.score;
        if (tool.keywords.includes(lowerInput)) confidence = 0.95;

        return {
            intent: 'GOTO_TOOL',
            confidence,
            response: `${RESPONSES.redirect}${toolName}...`,
            payload: { path: tool.path, context: tool.context || {} }
        };
    }

    return { intent: 'UNKNOWN', confidence: 0, response: RESPONSES.unknown[Math.floor(Math.random() * RESPONSES.unknown.length)] };
}
