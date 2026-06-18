# Sprint 17 — v1.8 Categories, Reports & Mobile Polish

## Done in code

- **Step 4 — Income categories** — DB table, templates, web/mobile forms, settings manager, setup seed
- **Step 5 — Reports polish** — Live category charts, SI/TA labels, PDF/CSV/WhatsApp exports
- **Mobile dark theme** — Finance, Staff, Approvals, AI tabs + add income/expense forms
- **Mobile notifications** — `/notifications` screen, home bell badge, pref filtering
- **App Store prep** — `app.json` v1.8.0, `pnpm mobile:build:prod`, [mobile-store-submit.md](./mobile-store-submit.md)

## Migrations to apply (if not yet on Supabase)

```bash
pnpm db:migrate
```

Adds `income_categories` (`20260618000004_income_categories.sql`).

## Smoke test (web)

1. Settings → Income Categories → sync templates
2. Add Income → category dropdown
3. Reports → period toggle → expense/income breakdown charts
4. Export PDF → category section with localized names

## Smoke test (mobile)

1. Settings → dark mode → all tabs
2. Home → bell → notifications → mark read
3. Add expense → category chips

## Next (launch)

Follow [mobile-store-submit.md](./mobile-store-submit.md):

```bash
cd apps/mobile && eas init
pnpm mobile:build:prod
```

Optional backlog: Phone OTP auth (v1.3 deferred).
