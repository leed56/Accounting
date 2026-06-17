# Vercel deployment (web app)

Root Directory in Vercel project settings: **`apps/web`**

The `vercel.json` in this folder runs install/build from the monorepo root so workspace packages resolve.

## Required environment variables (Vercel Dashboard → Settings → Environment Variables)

| Variable | Value |
|----------|--------|
| `NEXT_PUBLIC_SUPABASE_URL` | Your Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anon (public) key |

Do **not** add service role or database password to Vercel.

## Deploy

1. Connect GitHub repo `leed56/Accounting`
2. Set Root Directory to `apps/web`
3. Add env vars above
4. Deploy

Or use CLI from repo root:

```bash
npx vercel link
npx vercel env pull
npx vercel --prod
```
