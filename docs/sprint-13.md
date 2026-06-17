# Sprint 13 — v1.4 Premium Polish

## Done in code

- **Welcome hero** — gradient banner with greeting, company name, quick actions (web dashboard)
- **Notifications panel** — bell icon with unread count, mark read, links to approvals
- **Premium login** — split-screen brand panel (desktop) + elevated card
- **Mobile premium home** — green hero card, quick actions, live company name
- **Offline banner** — mobile shows when network unavailable
- **Push notifications scaffold** — expo-notifications (activates after `eas init`)
- **App icon assets** — `apps/mobile/assets/icon.png`

## Smoke test

1. **Web login** — see green brand panel on desktop
2. **Dashboard** — welcome hero with your name + quick action buttons
3. **Bell icon** — click notifications (add expense > Rs. 6000 to generate one)
4. **Mobile** — home hero + quick income/expense buttons
5. **Mobile offline** — turn off WiFi → orange banner appears

## Push notifications (after EAS)

```bash
cd apps/mobile && eas init   # sets projectId
pnpm mobile:build
```

## Store submit

See `docs/app-store-listing.md` for copy + screenshot checklist.

## Next (v1.6)

- Mobile global search
- Filter notifications by user preferences
- Full dark mode polish (sidebar, charts)
- Phone OTP auth (original v1.3 backlog)
