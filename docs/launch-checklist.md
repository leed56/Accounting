# BizManager — Launch Checklist

Use before App Store / Play Store submit and production cutover.

## Code & deploy

- [ ] **Commit + push** all v1.8 changes to `main`
- [ ] **Vercel** auto-deploy succeeds
- [ ] Run **`pnpm db:migrate`** if `income_categories` not yet on Supabase
- [ ] Smoke-test production: https://accounting-one-fawn.vercel.app

## Web smoke test

- [ ] Login → dashboard loads
- [ ] Settings → Income Categories → sync templates
- [ ] Add Income → category dropdown
- [ ] Reports → charts + PDF export
- [ ] `/privacy` loads without login

## Supabase (one-time)

- [ ] Redirect URL: `https://accounting-one-fawn.vercel.app/**`
- [ ] `SUPABASE_SERVICE_ROLE_KEY` on Vercel
- [ ] `NEXT_PUBLIC_APP_URL=https://accounting-one-fawn.vercel.app` on Vercel
- [ ] Enable email templates for invites
- [ ] Rotate any secrets shared during setup

## Demo / existing company

```bash
pnpm install
pnpm db:seed    # adds expense + income categories for Royal Travels
```

Or Settings → **Add missing template categories** (expense + income).

## Mobile store

- [ ] `cd apps/mobile && eas init`
- [ ] Set EAS env: `EXPO_PUBLIC_SUPABASE_URL`, `EXPO_PUBLIC_SUPABASE_ANON_KEY`
- [ ] `pnpm mobile:build` (preview) → test on device
- [ ] `pnpm mobile:build:prod` → submit

See [mobile-store-submit.md](./mobile-store-submit.md) and [app-store-listing.md](./app-store-listing.md).

## Store listing assets

- [ ] Privacy URL: https://accounting-one-fawn.vercel.app/privacy
- [ ] 7 screenshots (see app-store-listing.md)
- [ ] App description updated with v1.8 features

## Optional (deferred)

- Phone OTP auth (v1.3 backlog)
- Push token storage in Supabase
