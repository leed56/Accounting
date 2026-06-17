# Vercel deployment (web app)

Root Directory in Vercel project settings: **`apps/web`**

The `vercel.json` in this folder runs install/build from the monorepo root so workspace packages resolve.

## Required environment variables (Vercel Dashboard → Settings → Environment Variables)

| Variable | Value |
|----------|--------|
| `NEXT_PUBLIC_SUPABASE_URL` | Your Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anon (public) key |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase service role key (server-only, for team invites) |

Do **not** add database password to Vercel.

## Deploy

1. Connect GitHub repo `leed56/Accounting` in [Vercel Dashboard](https://vercel.com/yasu-s-projects3/accounting/settings/git)
2. **Root Directory:** leave as repository root (uses root `vercel.json`)
3. Env vars are already set on project `accounting`
4. Push to `main` triggers auto-deploy after Git is connected

Or CLI from repo root:

```bash
npx vercel --prod --scope yasu-s-projects3
```
