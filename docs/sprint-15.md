# Sprint 15 — v1.6 Mobile Search & Polish

## Done in code

- **Mobile global search** — `/search` screen with debounced `globalSearch`, search button on home hero
- **Notification filtering** — bell panel respects Settings prefs (`filterNotificationsByPrefs` in `@bizmanager/utils`)
- **Dark mode polish** — sidebar, bottom nav, charts (grid/tick/tooltip), notifications dropdown
- **Demo notifications** — sample approval, payroll, and leave items for testing prefs

## Smoke test

1. **Mobile** — tap 🔍 on home → search "Dialog" or "fuel" → tap result → navigates to Finance/Staff tab
2. **Web Settings** — turn off "Payment approval alerts" → bell shows fewer items (payroll/leave still visible if enabled)
3. **Dark mode** — toggle on → sidebar, charts, and notification panel use dark styling

## Next (v1.8)

- Apply dark theme to all mobile tabs
- Mobile notifications list (filtered by prefs)
- Phone OTP auth (v1.3 backlog)
- App Store submit (`eas init` → `pnpm mobile:build`)
