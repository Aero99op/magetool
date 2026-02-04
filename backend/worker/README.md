---
title: Magetool Worker
emoji: ⚡
colorFrom: purple
colorTo: blue
sdk: docker
pinned: false
---

# Magetool Worker - Distributed Chunk Processor

Deploy this folder to **3 separate HF Spaces** to create a processing cluster.

## HF Space Setup

1. Create new HF Space → Select **Docker SDK**
2. Upload: `main.py`, `requirements.txt`, `Dockerfile`
3. Space will auto-build and run on port 7860

## Worker Names (Suggested)

- `magetool-worker-1`
- `magetool-worker-2`  
- `magetool-worker-3`

## API Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/` | GET | Health + active task count |
| `/health` | GET | Detailed health with disk info |
| `/process-chunk` | POST | Process a video chunk |
| `/status/{task_id}` | GET | Get task status |
| `/download/{task_id}` | GET | Download processed chunk |

## How Cluster Works

```
            ┌──────────────────┐
            │   Main Backend   │
            │  (Orchestrator)  │
            └────────┬─────────┘
                     │
        ┌────────────┼────────────┐
        │            │            │
        ▼            ▼            ▼
   ┌─────────┐ ┌─────────┐ ┌─────────┐
   │ Worker 1│ │ Worker 2│ │ Worker 3│
   │ (Chunk1)│ │ (Chunk2)│ │ (Chunk3)│
   └────┬────┘ └────┬────┘ └────┬────┘
        │            │            │
        └────────────┼────────────┘
                     │
            ┌────────▼────────┐
            │  Merge Chunks   │
            │  (Final Video)  │
            └─────────────────┘
```
