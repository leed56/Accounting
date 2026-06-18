# BizManager Setup Guide

## Prerequisites

- Node.js 20+
- pnpm 9+
- Supabase account (optional for demo mode)

## Quick Start (Demo Mode)

Demo mode works without Supabase — sample Royal Travels Office data is built in.

```bash
cd F:\Accoutning
pnpm install
pnpm dev:web
```

Open http://localhost:3000 → Onboarding → Login → Dashboard

## Supabase connected (project: kghioyrzewxjvlmrtdjh)

Keys live in gitignored files only:
- `apps/web/.env.local` — anon key for web
- `apps/mobile/.env` — anon key for mobile
- `supabase/.env.local` — service role + DATABASE_URL (migrations only, never in client)

### Database commands

```bash
pnpm db:migrate    # apply schema (once)
pnpm db:seed       # Royal Travels sample data
pnpm db:link-owner your@email.com "Owner Name"
```

### Login (after link-owner)

- Email: `appleview778@gmail.com`
- Temp password: `BizManager2026!` — change after first login

### Admin: create a new customer company

One command — auth user + company + owner + categories:

```bash
pnpm admin:create-company kasun@gmail.com "Kasun Perera" "Shakthi Maths Academy" tuition_education
```

Optional 6th arg = temp password, 7th = language (`en` | `si` | `ta`).

Share with customer:

- Login: https://accounting-one-fawn.vercel.app/login
- Email + temp password from script output

See [admin-onboarding.md](./admin-onboarding.md) for full guide.

### Rotate keys when done testing

Supabase Dashboard → Settings → API → rotate anon + service role keys and database password.

## Mobile App

```bash
pnpm dev:mobile
```

Scan QR with Expo Go.

## Monorepo Structure

- `apps/web` — Next.js responsive dashboard
- `apps/mobile` — Expo React Native app
- `packages/design-tokens` — Shared design tokens
- `packages/i18n` — EN/SI/TA translations
- `packages/types` — Zod schemas + TypeScript types
- `packages/utils` — Currency, date, approval helpers
- `packages/supabase-client` — Supabase client + queries
- `packages/ai` — AI service abstraction
- `supabase/` — Migrations and seed data

## Optional: OpenAI

Set `OPENAI_API_KEY` to enable real LLM responses (falls back to mock otherwise).
