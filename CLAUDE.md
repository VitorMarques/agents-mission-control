# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Agents Mission Control is a Nuxt 4 + Vue 3 dashboard with a Kanban-style task management interface backed by Convex (serverless real-time database).

## Common Commands

```bash
# Development
npm run dev              # Start dev server (requires npx convex dev running)
npx convex dev           # Start Convex local dev (required first time and for schema changes)

# Type checking & building
npm run typecheck        # Run TypeScript type checking
npm run build            # Build for production
npm run preview          # Preview production build

# Testing
npm run test             # Run all tests
npm run test:watch       # Run tests in watch mode
```

## Environment Variables

Key variables in `.env`:

- `NUXT_PUBLIC_APP_NAME` - Display name in header (e.g., "Emfesta Marketing Team")
- `NUXT_PUBLIC_CONVEX_URL` - Convex deployment URL
- `CONVEX_DEPLOYMENT` - Convex deployment key
- `SESSION_SECRET` - Auth session secret

## Architecture

### Frontend (Nuxt 4)

- `app/pages/` - Page routes (index.vue, login.vue)
- `app/components/layout/` - Layout components (KanbanBoard, LiveFeed, MissionHeader, TaskDetailModal)
- `app/components/ui/` - Reusable UI components
- `app/types/mission.ts` - TypeScript type definitions

### Backend (Convex)

- `convex/schema.ts` - Database schema definitions (users, agents, tasks, messages, activities, documents, notifications)
- `convex/*.ts` - Queries and mutations per domain
- Uses generic wrappers (`queryGeneric`/`mutationGeneric`) for forward compatibility

### API Layer

- `server/api/auth/` - Authentication endpoints (login, register, logout, me)
- `server/api/mission/` - Dashboard data endpoint
- `server/api/tasks/` - Task operations

### Authentication

- Session-based auth with bcryptjs
- Roles: ADMIN, MANAGER, VIEWER
- Sessions stored in Convex with SHA-256 hashed tokens
- First user registered becomes ADMIN; subsequent registrations disabled

## Key Patterns

- Composition API with `<script setup>` syntax
- TailwindCSS with CSS variables for theming (dark mode support)
- Vue refs for local state, computed for derived state
- Convex for real-time data sync

## Development Notes

- Run `npx convex dev` before `npm run dev` to generate Convex types
- The app uses shadcn-vue patterns but components are custom-built with TailwindCSS
- Task details are displayed in a modal (TaskDetailModal.vue) that opens on card click
- The Kanban board supports drag-and-drop for authorized users (ADMIN/MANAGER only)
<!---->
