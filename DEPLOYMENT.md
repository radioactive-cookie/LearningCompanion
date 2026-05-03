# Deployment Guide (Vercel + Render)

This project deploys the frontend on Vercel and the backend on Render.

## 1) Render (Backend API)

### Create the service
- Connect the repo and choose the `render.yaml` blueprint.
- Service name: `learning-companion-api` (or your preferred name).

### Required environment variables
Set these in Render:
- `DATABASE_URL` = your Supabase Postgres connection string
- `GROQ_API_KEY` = your Groq API key
- `GROQ_API_KEY_BACKUP` = optional
- `SUPABASE_URL` = `https://YOUR_PROJECT.supabase.co`
- `SUPABASE_JWT_AUD` = `authenticated`
- `FRONTEND_ORIGIN` = `https://YOUR_VERCEL_DOMAIN.vercel.app`

### Build/Start (already in render.yaml)
- Build: `npm i -g pnpm@10.33.2 && pnpm install --frozen-lockfile && pnpm -C backend build`
- Start: `node --enable-source-maps backend/dist/index.mjs`

### Health check
- `https://YOUR_RENDER_BACKEND.onrender.com/api/healthz`


## 2) Vercel (Frontend)

### Connect project
- Import the repo in Vercel
- Framework preset: Vite

### Build settings (already in vercel.json)
- Install: `npm i -g pnpm@10.33.2 && pnpm install --frozen-lockfile`
- Build: `pnpm -C frontend build`
- Output: `frontend/dist/public`

### Update API rewrite
In `vercel.json`, replace:
- `https://YOUR_RENDER_BACKEND.onrender.com` with your Render URL

### Vercel environment variables
Set these in Vercel:
- `VITE_SUPABASE_URL` = `https://YOUR_PROJECT.supabase.co`
- `VITE_SUPABASE_ANON_KEY` = your Supabase anon key


## 3) Final checklist
- Render env vars set
- Vercel rewrite updated
- `FRONTEND_ORIGIN` points to your Vercel domain


## Notes
- If you switch domains later, update `FRONTEND_ORIGIN` and the Vercel rewrite.
