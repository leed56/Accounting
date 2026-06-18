# Sprint 16 — v1.7 Mobile Settings & Dark Mode

## Done in code

- **Mobile settings screen** — `/settings` with language, dark mode, notification prefs
- **Persisted preferences** — Zustand + AsyncStorage (`bizmanager-mobile` key)
- **Dark mode on mobile** — `useMobileTheme` hook; home, search, settings, tab bar
- **Settings access** — gear icon on home hero (next to search)

## Smoke test

1. **Mobile home** → tap ⚙️ → Settings opens
2. **Language** — switch SI/TA → labels update
3. **Dark mode** — toggle on → home/search/tab bar go dark; restart app → pref persists
4. **Notifications** — toggle approval alerts off → saved after app restart

## Next (v1.8)

- Apply dark theme to finance, staff, approvals, AI tabs
- Mobile notifications list (filtered by prefs)
- Phone OTP auth (v1.3 backlog)
- App Store submit (`eas init` → `pnpm mobile:build`)
