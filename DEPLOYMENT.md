# Magetool Deployment Guide

## 📁 Repository Structure

```
magetool/                  ← Single GitHub Repo
├── frontend/              ← Deployed to Vercel
│   ├── src/
│   ├── package.json
│   └── next.config.mjs
├── backend/               ← Deployed to Render + HF Spaces
│   ├── main.py
│   ├── requirements.txt
│   ├── Dockerfile         (Render)
│   └── Dockerfile.hf      (HF Spaces)
├── DEPLOYMENT.md
└── README.md
```

---

## 🔄 Architecture

```
                    ┌──────────────────────┐
                    │    GitHub Repo       │
                    │  (frontend + backend)│
                    └──────────┬───────────┘
                               │
            ┌──────────────────┼──────────────────┐
            ▼                  ▼                  ▼
       ┌─────────┐        ┌─────────┐       ┌──────────┐
       │ VERCEL  │        │ RENDER  │       │HF SPACES │
       │frontend/│        │backend/ │       │backend/  │
       └────┬────┘        └────┬────┘       └────┬─────┘
            │                  │                  │
            │                  └────────┬─────────┘
            │                           │
            ▼                           ▼
       Next.js App              FastAPI Backend
       (UI/UX)                  (API + Processing)
```

---

## Step 1: Push ENTIRE Project to GitHub

```bash
cd "d:\magetool website"

# Initialize git (if not already)
git init

# Add everything
git add .

# Commit
git commit -m "Full stack: frontend + backend with security"

# Add remote (replace with your repo URL)
git remote add origin https://github.com/YOUR_USERNAME/magetool.git

# Push
git push -u origin main
```

Your GitHub repo now has BOTH `frontend/` and `backend/` folders.

---

## Step 2: Deploy Frontend to Vercel

1. Go to [vercel.com](https://vercel.com) → **Add New Project**
2. **Import** your GitHub repo: `magetool`
3. Configure:

   | Setting | Value |
   |---------|-------|
   | Framework Preset | Next.js |
   | Root Directory | `frontend` ← **IMPORTANT** |
   | Build Command | `npm run build` |
   | Output Directory | `.next` |

4. Add Environment Variable:
   ```
   NEXT_PUBLIC_API_URL = (leave empty for now, add after backend deploy)
   ```

5. Click **Deploy**
6. **Note your URL**: `https://magetool.vercel.app`

---

## Step 3: Deploy Backend to Render

1. Go to [render.com](https://render.com) → **New** → **Web Service**
2. Connect your GitHub repo: `magetool`
3. Configure:

   | Setting | Value |
   |---------|-------|
   | Name | `magetool-api` |
   | Root Directory | `backend` ← **IMPORTANT** |
   | Runtime | Python 3 |
   | Build Command | `pip install -r requirements.txt` |
   | Start Command | `uvicorn main:app --host 0.0.0.0 --port $PORT` |

4. Add Environment Variables:
   ```
   ENVIRONMENT = production
   DEBUG = false
   CORS_ORIGINS = ["https://magetool.vercel.app"]
   ```

5. Click **Create Web Service**
6. **Note your URL**: `https://magetool-api.onrender.com`

---

## Step 4: Deploy Backend to Hugging Face Spaces

1. Go to [huggingface.co/new-space](https://huggingface.co/new-space)
2. Create Space:

   | Setting | Value |
   |---------|-------|
   | Space name | `magetool-backend` |
   | SDK | Docker |
   | Hardware | CPU Basic (or GPU for AI) |

3. **Link to GitHub** (Settings → Repository):
   - Or manually sync the `backend/` folder

4. **Rename Dockerfile**: 
   - Copy `Dockerfile.hf` to `Dockerfile` (HF needs exactly `Dockerfile`)
   - Or update the existing Dockerfile port from 8000 to 7860

5. Add Secrets (Settings → Repository secrets):
   ```
   ENVIRONMENT = production
   DEBUG = false
   CORS_ORIGINS = ["https://magetool.vercel.app"]
   ```

6. **Note your URL**: `https://YOUR-USERNAME-magetool-backend.hf.space`

---

## Step 5: Update Vercel with Backend URLs

1. Go to Vercel Dashboard → Your Project → Settings → Environment Variables
2. Update:
   ```
   NEXT_PUBLIC_API_URL = https://magetool-api.onrender.com
   ```
3. **Redeploy**: Deployments → Redeploy

---

## ✅ Final Configuration Summary

| Platform | Folder | URL | Purpose |
|----------|--------|-----|---------|
| **GitHub** | entire repo | github.com/you/magetool | Source code |
| **Vercel** | `frontend/` | magetool.vercel.app | Next.js UI |
| **Render** | `backend/` | magetool-api.onrender.com | Main API |
| **HF Spaces** | `backend/` | you-magetool.hf.space | AI API (GPU) |

---

## 🔄 Auto-Deploy on Git Push

After setup, just push to GitHub and all platforms auto-deploy:

```bash
git add .
git commit -m "New feature"
git push
# → Vercel, Render, and HF Spaces all rebuild automatically!
```

---

## Environment Variables Quick Reference

### Vercel (Frontend)
```
NEXT_PUBLIC_API_URL = https://magetool-api.onrender.com
```

### Render (Backend)
```
ENVIRONMENT = production
DEBUG = false
CORS_ORIGINS = ["https://magetool.vercel.app"]
```

### HF Spaces (Backend)
```
ENVIRONMENT = production
DEBUG = false
CORS_ORIGINS = ["https://magetool.vercel.app"]
```

---

## Troubleshooting

| Problem | Solution |
|---------|----------|
| CORS error | Add Vercel URL to backend CORS_ORIGINS |
| 404 on API calls | Check NEXT_PUBLIC_API_URL on Vercel |
| Build fails | Check logs on respective platform |
| HF 502 error | Ensure Dockerfile uses port 7860 |
| Render cold starts | Upgrade tier or add keep-alive ping |
