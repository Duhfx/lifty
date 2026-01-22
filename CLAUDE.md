# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Lifty is a PWA (Progressive Web App) for gym workout tracking. Users can create workouts, add exercises, record sets (reps + weight), and track their progress over time.

## Architecture

**Monorepo Structure:**
- `frontend/` - Next.js 16 app (App Router) with TypeScript
- `backend/` - Nest.js API with TypeScript
- `docs/` - Documentation and SQL migrations

**Tech Stack:**
- Frontend: Next.js, Tailwind CSS, Radix UI, Zustand (state), Recharts (charts), Framer Motion
- Backend: Nest.js, class-validator, JWT auth
- Database: PostgreSQL via Supabase with Row Level Security (RLS)
- Auth: Supabase Auth integrated with Nest.js JWT validation

## Development Commands

### Frontend (from `frontend/` directory)
```bash
npm run dev      # Start dev server (localhost:3000)
npm run build    # Production build
npm run lint     # ESLint
```

### Backend (from `backend/` directory)
```bash
npm run start:dev    # Start with hot-reload (localhost:3001)
npm run build        # Compile to dist/
npm run start:prod   # Run compiled version
npm run lint         # ESLint with auto-fix
npm run test         # Jest unit tests
npm run test:watch   # Jest in watch mode
npm run test:e2e     # End-to-end tests
```

## Key Architecture Patterns

### Frontend State Management
- **Zustand stores** in `frontend/store/`:
  - `authStore.ts` - Authentication state and user info
  - `workoutStore.ts` - Workouts CRUD with API integration
  - `sessionStore.ts` - Active workout sessions and sets

### Backend Module Structure
Each feature follows Nest.js module pattern in `backend/src/`:
- `auth/` - Authentication (Supabase integration, JWT guard, CurrentUser decorator)
- `workouts/` - Workout CRUD and exercises management
- `sessions/` - Workout execution, sets recording

### Authentication Flow
1. Frontend uses Supabase client directly for signup/signin
2. JWT tokens stored and managed via `authStore`
3. Backend validates JWT via `AuthGuard` on protected routes
4. `@CurrentUser()` decorator extracts user from request

### Database Schema (Supabase)
- `workouts` - User's workout templates
- `workout_exercises` - Exercises belonging to workouts (with order_index)
- `workout_sessions` - Executed workout instances
- `sets` - Individual sets with reps and weight

All tables have RLS policies restricting access to owner's data only.

## Environment Variables

### Frontend (`frontend/.env.local`)
- `NEXT_PUBLIC_API_URL` - Backend API URL (default: http://localhost:3001/api)
- `NEXT_PUBLIC_SUPABASE_URL` - Supabase project URL
- `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` - Supabase anon key

### Backend (`backend/.env`)
- `PORT` - Server port (default: 3001)
- `SUPABASE_URL`, `SUPABASE_PUBLISHABLE_KEY`, `SUPABASE_SECRET_KEY`
- `JWT_SECRET`, `JWT_EXPIRATION`
- `ALLOWED_ORIGINS` - CORS whitelist

## Database Migrations

Migrations are in `docs/migrations/`. Execute manually via Supabase SQL Editor.
See `docs/migrations/README.md` for instructions.

## API Routes

Backend serves all endpoints under `/api` prefix:
- `POST /api/auth/signup`, `/api/auth/signin` - Authentication
- `GET/POST /api/workouts` - Workout CRUD
- `POST /api/workouts/:id/exercises` - Add exercises to workout
- `POST /api/sessions` - Start workout session
- `POST /api/sessions/:id/sets` - Record sets during session

## Language

The app UI and documentation are in Portuguese (Brazilian). Code and technical comments are in English.
