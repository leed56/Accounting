# Sprint 12 — v1.3 Launch Prep

## Done in code

- **Batch payslip PDF** — Payroll → "Download All Payslips" (single multi-page PDF)
- **Email invites** — Settings invite sends Supabase invite email (falls back to temp password)
- **EAS build config** — `apps/mobile/eas.json` + build scripts
- **SI/TA** — payslip + invite strings translated

## EAS setup (one-time)

```bash
npm install -g eas-cli
cd apps/mobile
eas login
eas init          # links project, sets projectId in app.json
```

Set env in EAS dashboard or `eas.json` profiles:
- `EXPO_PUBLIC_SUPABASE_URL`
- `EXPO_PUBLIC_SUPABASE_ANON_KEY`

## Build commands

```bash
pnpm mobile:build                    # preview APK + iOS internal
cd apps/mobile && pnpm build:prod    # production store build
```

Before store submit: add `assets/icon.png`, `assets/splash.png` (1024×1024 icon recommended).

## Vercel env (optional)

```
NEXT_PUBLIC_APP_URL=https://accounting-one-fawn.vercel.app
```

Used for invite email redirect to `/login`.

## Supabase email

Enable email auth in Supabase Dashboard → Authentication → Email templates.
Invite emails use the built-in "Invite user" template.

## Smoke test

1. Payroll → Generate → **Download All Payslips**
2. Settings → Invite manager → check email inbox (or temp password fallback)
3. Switch language to සිංහල → verify payslip button label

## Next (v1.4)

- App icons + splash assets
- App Store / Play Store listings
- Push notifications
- Offline mode (mobile)
