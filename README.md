# Learning Companion

Learning Companion is a full-stack, AI-powered coding education platform. It combines an AI tutor chat, structured multi-level lessons across multiple languages, and progress tracking with streaks and certificates.

## Features

- **AI tutor chat** with topic suggestions and guided prompts
- **Structured learning paths** with 5 levels per topic: Fundamentals, Introduction, Hands-on, Deep Dive, Challenge
- **12 supported languages** including Python, JavaScript, TypeScript, React, Java, C++, Go, SQL, Ruby, PHP, HTML, and CSS
- **Progress tracking** with streaks and an activity heatmap
- **Certificates** for completed topics
- **Guest mode** with a limited number of free AI messages, plus sign-in to save history and progress

## Project structure

- `frontend/` — React + Vite client
- `backend/` — Express API server
- `lib/` — shared packages (API schema, DB, auth helpers)

## Getting started

### Prerequisites

- Node.js 24
- pnpm 10.33.2

### Install dependencies

```bash
pnpm install --frozen-lockfile
```

### Configure environment variables

Create `backend/.env`:

```
PORT=3001
DATABASE_URL=postgresql://USER:PASSWORD@HOST:5432/DATABASE
GROQ_API_KEY=your_groq_api_key
GROQ_API_KEY_BACKUP=optional_backup_key
FRONTEND_ORIGIN=http://localhost:5173
SUPABASE_URL=https://YOUR_PROJECT.supabase.co
SUPABASE_JWT_AUD=authenticated
```

Create `frontend/.env`:

```
VITE_SUPABASE_URL=https://YOUR_PROJECT.supabase.co
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### Run locally

```bash
# Terminal 1: API server
pnpm -C backend dev

# Terminal 2: frontend
pnpm -C frontend dev
```

- Backend default: `http://localhost:3001`
- Frontend default: `http://localhost:5173`

## Using the platform

1. Open the landing page and choose **Start Learning**.
2. Select a language and difficulty to get curated topics.
3. Complete each topic’s 5 levels in order.
4. Use **AI Chat** for questions, explanations, and practice.
5. Sign in to save progress, view history, track streaks, and download certificates.

## Useful commands

```bash
pnpm run typecheck
pnpm run build
pnpm -C backend build
pnpm -C frontend build
```

## Deployment

See [DEPLOYMENT.md](./DEPLOYMENT.md) for Render (backend) and Vercel (frontend) setup.
