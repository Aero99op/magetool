# Magetool - Enterprise File Utility Platform

A powerful, production-ready web application for file conversion and manipulation.

## Features

- 🖼️ **Image Tools**: Convert, resize, crop, remove backgrounds, upscale, OCR
- 🎬 **Video Tools**: Convert, extract audio, trim, compress, download from YouTube
- 🎵 **Audio Tools**: Convert, trim, adjust volume, detect BPM
- 📄 **Document Tools**: Convert, merge/split PDFs, data format conversion

## Tech Stack

- **Frontend**: Next.js 14, React 18, TypeScript, Framer Motion
- **Backend**: Python FastAPI, FFmpeg, Pillow, PyPDF2
- **Design**: Glassmorphic UI (Neon Blue + Silk Black)

## Quick Start

### Prerequisites
- Node.js 18+
- Python 3.10+
- FFmpeg

### Frontend Setup
```bash
cd frontend
npm install
npm run dev
```

### Backend Setup
```bash
cd backend
python -m venv venv
venv\Scripts\activate  # Windows
pip install -r requirements.txt
uvicorn main:app --reload
```

### Docker (Recommended)
```bash
docker-compose up --build
```

## 🚀 Deployment

See [DEPLOYMENT.md](./DEPLOYMENT.md) for full instructions on:
- GitHub + Vercel (Frontend)
- Render or Hugging Face Spaces (Backend)

## Project Structure

```
magetool-website/
├── frontend/               # Next.js frontend
│   ├── src/
│   │   ├── app/           # Pages (App Router)
│   │   ├── components/    # Reusable components
│   │   └── lib/           # Utilities
│   └── package.json
├── backend/               # FastAPI backend
│   ├── routes/            # API endpoints
│   ├── services/          # Business logic
│   ├── main.py           # App entry
│   └── requirements.txt
└── docker-compose.yml
```

## API Endpoints

| Category | Endpoint | Description |
|----------|----------|-------------|
| Health | `GET /health/live` | Liveness check |
| Health | `GET /health/ready` | Readiness check |
| Image | `POST /api/image/convert` | Convert image format |
| Image | `POST /api/image/resize` | Resize image |
| Video | `POST /api/video/convert` | Convert video format |
| Video | `POST /api/video/extract-audio` | Extract audio |
| Audio | `POST /api/audio/convert` | Convert audio format |
| Document | `POST /api/pdf/merge` | Merge PDFs |

## License

MIT
