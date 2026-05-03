# Learning Companion Bot

## Overview

A full-stack AI-powered coding education platform. Users can chat with an AI tutor, follow structured "Learn to Code" lessons across 12 programming languages, track their progress with streaks and heatmaps, and earn completion certificates.

## Stack

- **Monorepo tool**: pnpm workspaces
- **Node.js version**: 24
- **Package manager**: pnpm
- **TypeScript version**: 5.9
- **Frontend**: React 19 + Vite + Tailwind CSS v4 + shadcn/ui
- **Router**: Wouter
- **API framework**: Express 5
- **Database**: PostgreSQL + Drizzle ORM
- **AI backend**: Groq SDK (llama-3.3-70b-versatile + llama-3.1-8b-instant)
- **Validation**: Zod (`zod/v4`), `drizzle-zod`
- **API codegen**: Orval (from OpenAPI spec)
- **Build**: esbuild (CJS bundle)

## Key Commands

- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks and Zod schemas from OpenAPI spec
- `pnpm --filter @workspace/db run push` — push DB schema changes (dev only)
- `pnpm --filter @workspace/api-server run dev` — run API server locally

## Artifacts

### `artifacts/learning-companion` — React Frontend (serves at `/`)
- **Pages**: Landing (`/`), Chat (`/chat`), History (`/history`), Learn (`/learn`), Progress (`/progress`), Certificate (`/certificate/:id`)
- **Features**: AI chat assistant, structured 4-level lessons per topic, conversation history, streak tracking, activity heatmap, printable certificates

### `artifacts/api-server` — Express API (serves at `/api`)
- **Routes**: `/api/ai` (chat), `/api/ai/usage`, `/api/ai/history`, `/api/ai/topics`, `/api/learn`, `/api/learn/progress`, `/api/certificates`, `/api/project`
- Uses Groq for AI completions (primary + backup key support with rate-limit fallback)

## Key Libraries

- `lib/api-spec` — OpenAPI YAML spec (source of truth for all API contracts)
- `lib/api-client-react` — Generated React Query hooks for the frontend
- `lib/api-zod` — Generated Zod schemas for server-side validation
- `lib/db` — Drizzle ORM schema and DB client

## Database Schema

- `conversations` — Chat sessions
- `messages` — Individual chat messages per conversation
- `learn_progress` — Per-user topic progress (completed levels)
- `streak_activity` — Daily activity dates for streak tracking
- `certificates` — Completion certificates (idempotent per user+language+topic)

## Environment Variables Required

- `GROQ_API_KEY` — Groq API key for AI completions (required)
- `DATABASE_URL` — PostgreSQL connection string (auto-provisioned by Replit)
- `GROQ_API_KEY_BACKUP` — Optional backup Groq key for rate-limit failover

See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details.
