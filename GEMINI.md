# Lifty - Project Context for Gemini

## 1. Project Overview
**Lifty** is a Progressive Web App (PWA) for gym workout tracking. It allows users to create workout templates, log exercises (sets, reps, weight), and visualize progress over time.
- **Goal:** Provide a simple, premium-feeling workout tracker.
- **Current Status:** MVP in development (Phase 0/1).
- **Language:** UI/Docs in Portuguese (pt-BR); Code/Comments in English.

## 2. Tech Stack

### Frontend (`/frontend`)
- **Framework:** Next.js 16 (App Router)
- **Language:** TypeScript
- **Styling:** Tailwind CSS + Radix UI
- **State Management:** Zustand
- **Validation:** Zod + React Hook Form
- **Charts:** Recharts
- **Animation:** Framer Motion

### Backend (`/backend`)
- **Framework:** Nest.js
- **Language:** TypeScript
- **Database:** PostgreSQL (via Supabase)
- **Auth:** Supabase Auth (JWT validation in Nest.js)
- **Validation:** class-validator
- **Testing:** Jest

## 3. Architecture & Conventions

### Authentication Flow
1. **Frontend:** User logs in via Supabase Client (`frontend/lib/supabase.ts`).
2. **Token:** JWT is stored and managed via `authStore`.
3. **Backend:** Requests to API include the Bearer token.
4. **Validation:** Backend `AuthGuard` validates the token with Supabase and extracts the user (`@CurrentUser()`).

### State Management (Frontend)
Zustand stores are central to data handling:
- `authStore.ts`: User session and auth state.
- `workoutStore.ts`: Workouts CRUD and caching.
- `sessionStore.ts`: Active workout session logic.

### Database Schema (Supabase)
- `workouts`: User's workout templates.
- `workout_exercises`: Linked exercises.
- `workout_sessions`: History of executed workouts.
- `sets`: Detailed log of reps/weight.
- **Security:** RLS (Row Level Security) ensures users only access their own data.

## 4. Development Commands

### Frontend
Run in `/frontend`:
- `npm run dev`: Start dev server (localhost:3000)
- `npm run build`: Production build
- `npm run lint`: Run ESLint

### Backend
Run in `/backend`:
- `npm run start:dev`: Start with hot-reload (localhost:3001)
- `npm run test`: Run unit tests
- `npm run test:e2e`: Run end-to-end tests

## 5. Key Files & Directories

- **`frontend/app/`**: Next.js App Router pages.
- **`frontend/store/`**: Zustand state stores.
- **`frontend/components/ui/`**: Reusable UI components (shadcn/radix style).
- **`backend/src/app.module.ts`**: Main module registry.
- **`backend/src/auth/`**: Auth logic and guards.
- **`docs/migrations/`**: SQL files for database schema changes.

## 6. Important Context for Gemini
- **Strict Typing:** Always prioritize strict TypeScript types.
- **Monorepo Awareness:** Be aware of the distinction between `frontend` and `backend` directories when running commands or searching files.
- **No Global Exercises:** The MVP designs exercises as children of workouts, not from a global database.
- **Conventions:** Follow existing patterns in `CLAUDE.md` and `README.md`.
