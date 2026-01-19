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

## Step 2: Deploy Frontend to Netlify

1. Go to [netlify.com](https://www.netlify.com) → **Add new site** → **Import an existing project**
2. Connect **GitHub** and select your repo: `magetool`
3. Configure:
   
   | Setting | Value |
   |---------|-------|
   | Base directory | `frontend` |
   | Build command | `npm run build` |
   | Publish directory | `.next` |

4. **Environment Variables** (Site settings → Environment variables):
   ```
   NEXT_PUBLIC_API_URL = https://your-backend-url.onrender.com
   ```
   *(Use your Render or Hugging Face backend URL)*

5. Click **Deploy**
6. **Note your URL**: `https://magetool.netlify.app`

---

## Step 3: Deploy Backend to Render

1. Go to [render.com](https://render.com) → **New** → **Web Service**
2. Connect your GitHub repo: `magetool`
3. Configure:

   | Setting | Value |
   |---------|-------|
   | Name | `magetool-api` |
   | Root Directory | `backend` ← **IMPORTANT** |
   | Runtime | Docker |
   | Build Command | (Auto-detected from Dockerfile) |
   | Start Command | (Auto-detected from Dockerfile) |

4. Add Environment Variables:
   ```
   ENVIRONMENT = production
   DEBUG = false
   CORS_ORIGINS = ["https://magetool-one.vercel.app"]
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
   CORS_ORIGINS = ["https://magetool-one.vercel.app"]
   ```

6. **Note your URL**: `https://YOUR-USERNAME-magetool-backend.hf.space`

---

## Step 5: Update Netlify with Backend URLs

1. Go to Netlify Dashboard → Site Settings → Environment variables
2. Add/Update:
   ```
   NEXT_PUBLIC_API_URL = https://magetool-api.onrender.com
   ```
3. **Trigger Redeploy**: Deploys → Trigger deploy

---

## ✅ Final Configuration Summary

| Platform | Folder | URL | Purpose |
|----------|--------|-----|---------|
| **GitHub** | entire repo | github.com/you/magetool | Source code |
| **Netlify** | `frontend/` | magetool.netlify.app | Next.js UI |
| **Render** | `backend/` | magetool-api.onrender.com | Main API |
| **HF Spaces** | `backend/` | you-magetool.hf.space | AI API (GPU) |

---

## 🔄 Auto-Deploy on Git Push

After setup, just push to GitHub and all platforms auto-deploy:

```bash
git add .
git commit -m "New feature"
git push
# → Netlify, Render, and HF Spaces all rebuild automatically!
```

---

## Environment Variables Quick Reference

### Netlify (Frontend)
```
NEXT_PUBLIC_API_URL = https://magetool-api.onrender.com
```

### Render (Backend)
```
ENVIRONMENT = production
DEBUG = false
CORS_ORIGINS = ["https://magetool-one.vercel.app"]
```

### HF Spaces (Backend)
```
ENVIRONMENT = production
DEBUG = false
CORS_ORIGINS = ["https://magetool-one.vercel.app"]
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

## ⚡ Zero-Cost "Unlimited" Hosting (Gareeb Pro Max Tips)

Render and Zeabur have a **750-hour/month** limit. If you keep them awake 24/7, your quota will end before the month does. To save every single minute, follow this:

### 🏆 Primary Choice: Hugging Face Spaces
**Why?** HF Spaces don't have a "750-hour" monthly meter. They just run for free. 
- They sleep after inactivity, but waking them up costs **nothing** from your quota.
- Update your Frontend `NEXT_PUBLIC_API_URL` to your Hugging Face Space URL.

### 🕒 Secondary Choice: Render/Zeabur (On-Demand)
Use these only as backups. Don't ping them. Let them sleep. 
- When a user hits the site, the first request will take 30-50s to wake up.
- This way, you **only** spend hours when an actual user is using the tool.

---

## 🛠️ Performance Optimization

If your server is sleeping, the first user will find it slow. Instead of a background ping, we use **Lazy Waking**:
1. When the user lands on the Landing Page, the frontend sends a *single* small request.
2. By the time the user selects their file and settings, the server is already warm.
3. This saves hours because if no one visits the site, the server stays dead.

