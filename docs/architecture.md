# BizManager Architecture

## Overview

BizManager is a pnpm + Turborepo monorepo with two clients (Next.js web, Expo mobile) sharing packages for i18n, types, utils, Supabase client, and AI services.

## Data Flow

1. Client apps use TanStack Query for server state
2. Supabase client queries PostgreSQL with RLS
3. Demo mode returns sample Royal Travels data when Supabase URL is placeholder
4. AI service uses MockAIService by default; OpenAIService when API key present

## Auth

- Supabase Auth email/password
- Profile links auth.users to company
- RLS isolates all data by company_id

## Roles

- **Owner**: Full access, approvals
- **Manager**: CRUD finance/staff, cannot approve high-value
- **Staff**: Optional MVP — deferred

See `docs/rls-policies.md` for RLS details.
