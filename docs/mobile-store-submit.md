# BizManager Mobile — App Store / Play Store Submit

Use this runbook after v1.8 code is merged and deployed on web.

## Prerequisites

- [ ] Apple Developer account ($99/yr) for iOS
- [ ] Google Play Console account ($25 one-time) for Android
- [ ] Production Supabase URL + anon key (same as web)
- [ ] App icons in `apps/mobile/assets/` (icon, adaptive-icon, notification-icon)

## 1. One-time EAS setup

```bash
npm install -g eas-cli
cd apps/mobile
eas login
eas init
```

`eas init` writes a real `projectId` into `app.json` → `extra.eas.projectId` (replaces `REPLACE_WITH_EAS_PROJECT_ID`).

Copy env for local dev:

```bash
cp .env.example .env
# Set EXPO_PUBLIC_SUPABASE_URL and EXPO_PUBLIC_SUPABASE_ANON_KEY
```

## 2. Set build secrets (EAS dashboard)

Project → **Environment variables** → add for **preview** and **production**:

| Variable | Value |
|----------|--------|
| `EXPO_PUBLIC_SUPABASE_URL` | `https://kghioyrzewxjvlmrtdjh.supabase.co` |
| `EXPO_PUBLIC_SUPABASE_ANON_KEY` | Your anon key |

Or edit `apps/mobile/eas.json` `env` blocks (avoid committing real keys — prefer EAS secrets).

## 3. Preview build (internal testing)

From repo root:

```bash
pnpm mobile:build
```

- Android: APK for sideload / internal track
- iOS: internal distribution (register test devices in Apple Developer)

Install on a phone and smoke-test:

1. Login → Home metrics load
2. Add income / expense (category chips)
3. Settings → dark mode + language persist
4. Bell icon → notifications list, mark read
5. Search → find a customer

## 4. Production store build

```bash
pnpm mobile:build:prod
```

`production` profile uses `autoIncrement` for build numbers. App version is **1.8.0** in `app.json`.

## 5. Store listing

Fill in [app-store-listing.md](./app-store-listing.md):

- Privacy policy: `https://accounting-one-fawn.vercel.app/privacy`
- Screenshots (7 listed in doc)
- Description mentions v1.8: income categories, reports, dark mode, notifications

## 6. Submit to stores

Update `apps/mobile/eas.json` → `submit.production` with your Apple ID, ASC app ID, team ID, and Android service account JSON path.

```bash
pnpm mobile:submit
```

Or submit manually from [expo.dev](https://expo.dev) after build completes.

## 7. Push notifications (post-submit)

Push tokens register only after `eas init` sets a real `projectId`. `usePushNotifications` in the app requests permission on launch; wire token storage to Supabase in a future sprint if needed.

## Troubleshooting

| Issue | Fix |
|-------|-----|
| Build fails on env | Set EAS secrets for Supabase vars |
| Demo data only | Check `EXPO_PUBLIC_SUPABASE_URL` is not placeholder |
| Push token null | Run `eas init`; test on physical device |
| iOS signing | First build prompts for credentials — let EAS manage |

## Related

- [Sprint 12 — EAS intro](./sprint-12.md)
- [App Store listing draft](./app-store-listing.md)
- [Setup guide](./setup.md)
