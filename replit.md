# Learning Companion Bot

## Overview

A full-stack AI-powered coding education platform with Replit Auth. Users can chat with an AI tutor, follow structured "Learn to Code" lessons across 12 programming languages, track their progress with streaks and heatmaps, and earn completion certificates. Guest users get 5 free AI messages before being prompted to log in.

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
- **Auth**: Replit Auth (OIDC/PKCE via `openid-client`) — `lib/replit-auth-web` provides `useAuth()` hook
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
- **Features**: AI chat assistant, structured 5-level lessons per topic, conversation history (auth-gated), streak tracking, activity heatmap, printable certificates
- **Auth UX**: `useAuth()` hook in all pages. Sidebar shows login button (guests) or user avatar + logout (authenticated). Guest users see 5-message limit prompt then login modal.

### `artifacts/api-server` — Express API (serves at `/api`)
- **Auth routes**: `/api/login`, `/api/logout`, `/api/callback`, `/api/auth/user`
- **Routes**: `/api/ai` (chat), `/api/ai/usage`, `/api/ai/history` (auth required), `/api/ai/topics`, `/api/learn`, `/api/learn/progress` (auth required), `/api/certificates` (auth required), `/api/project`
- Uses Groq for AI completions (primary + backup key support with rate-limit fallback)
- `authMiddleware` populates `req.user` on every request; `req.isAuthenticated()` checks auth status

## Key Libraries

- `lib/api-spec` — OpenAPI YAML spec (source of truth for all API contracts)
- `lib/api-client-react` — Generated React Query hooks for the frontend; also exports `AuthUser` interface
- `lib/api-zod` — Generated Zod schemas for server-side validation; also exports auth Zod schemas
- `lib/db` — Drizzle ORM schema and DB client
- `lib/replit-auth-web` — `useAuth()` hook for frontend auth state (user, isLoading, isAuthenticated, login, logout)

## Database Schema

- `sessions` — Express session store (Replit Auth)
- `users` — Authenticated user profiles (from Replit OIDC)
- `conversations` — Chat sessions; `userId` column links to authenticated user (nullable for guest chats)
- `messages` — Individual chat messages per conversation
- `learn_progress` — Per-user topic progress (completed levels); requires auth
- `streak_activity` — Daily activity dates for streak tracking; requires auth
- `certificates` — Completion certificates (idempotent per user+language+topic); requires auth; `userName` derived from auth profile

## Auth Behaviour

| Feature | Guest | Authenticated |
|---|---|---|
| AI Chat | Up to 5 messages, then login prompt | Unlimited, history saved per user |
| Conversation History | Login prompt shown | Private, per-user |
| Learn to Code | Browse topics, lessons | Progress saved to account |
| My Progress | Login prompt shown | Streaks, heatmap, certificates |
| Certificates | Not available | Name auto-filled from account |

## Environment Variables Required

- `GROQ_API_KEY` — Groq API key for AI completions (required)
- `DATABASE_URL` — PostgreSQL connection string (auto-provisioned by Replit)
- `SESSION_SECRET` — Secret for Express session signing (required for auth)
- `GROQ_API_KEY_BACKUP` — Optional backup Groq key for rate-limit failover

See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details.
