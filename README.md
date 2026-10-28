# Chozen Portfolio

A premium, responsive personal portfolio for **Chozen** with a private admin dashboard. Visitors see published projects, source code, classes, e-books, an about section, stats, contact links and a "Support the work" bank-transfer flow. The owner signs in at `/admin` (also reachable via `/chozen`) to manage everything.

Runs anywhere Node.js runs (your PC, Vercel, any Node host). It does **not** need Lovable.

## Tech stack
- React 19 + TanStack Start (file routes, server-side rendering) on Vite
- Tailwind CSS v4, shadcn/ui components
- Supabase only: PostgreSQL, Auth (email/password + password recovery), Storage, Row Level Security
- `@supabase/supabase-js` (no ORM — Drizzle has been removed)
- Nitro server output (Node server locally, auto-detected Vercel output on Vercel)

## Features
- Public single-page portfolio + project detail pages, SSR, published content only
- Admin dashboard: hero/profile, about blocks, stats, projects, source code, classes, e-books, social links, settings, support receipts
- Drafts / publish / reorder / delete with confirmation
- Private image & file uploads (Supabase Storage, signed URLs)
- Owner-only sign-in, no public sign-up, forgot/reset password

## Requirements
Node.js **22 LTS** (22.12+), npm 10+, Git, and a Supabase project.

## Quick start
```sh
npm ci
cp .env.example .env.local     # Windows PowerShell: Copy-Item .env.example .env.local
# edit .env.local with your Supabase URL + publishable key
npm run dev                    # http://localhost:3000
```

## Environment variables
| Name | Where | Purpose |
| --- | --- | --- |
| `VITE_SUPABASE_URL` | required | Supabase project URL |
| `VITE_SUPABASE_PUBLISHABLE_KEY` | required | Publishable (or legacy anon) key — public, safe in browser |
| `SUPABASE_URL`, `SUPABASE_PUBLISHABLE_KEY` | optional, server | Override the server-side URL/key |
| `SUPABASE_SECRET_KEY` | one-time local only | Used only by `npm run storage:setup`; never deploy it |

## Supabase setup (summary)
1. `npx supabase login` → `npx supabase link --project-ref <your-ref>` → `npx supabase db push` (applies `supabase/migrations/*.sql`).
2. `npm run storage:setup` once (creates private `images`, `files`, `receipts` buckets).
3. Disable sign-ups, add redirect URLs, create the owner user (first user = admin).

## Scripts
`dev`, `build`, `preview`, `start` (runs built Node server), `lint`, `typecheck`, `test`, `storage:setup`.

## Deploy
Push to GitHub → import into Vercel → add the two `VITE_` env vars → deploy. Details, Windows steps and troubleshooting: **[RUN_OUTSIDE_LOVABLE.md](RUN_OUTSIDE_LOVABLE.md)**.
