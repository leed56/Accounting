# Sprint 14 — v1.5 Search, Preferences & Roles

## Done in code

- **Global search** — top bar search across customers, suppliers, transactions, staff (`globalSearch` query + dropdown)
- **Notification preferences** — Settings toggles for approvals, payroll, leave (persisted in local storage)
- **Dark mode** — Settings toggle + `ThemeProvider` with Tailwind `dark:` styles on core components
- **Accountant role** — invite as read-only; `usePermissions` hook hides write/approve actions; RLS migration adds `accountant` enum

## Smoke test

1. **Search** — type "Dialog" or "fuel" in top bar → see supplier/transaction results
2. **Settings → Notifications** — toggle prefs, refresh page → prefs persist
3. **Settings → Dark mode** — toggle on → cards/input fields use dark theme
4. **Accountant invite** — invite user with Accountant role → they see read-only banner, no Add buttons

## Database migration

Run on Supabase (if not already applied):

```bash
supabase db push
# or apply supabase/migrations/20260617000002_add_accountant_role.sql manually
```

## Next (v1.6)

- Mobile global search
- Filter notifications by user preferences
- Full dark mode polish (sidebar, charts)
- Phone OTP auth (original v1.3 backlog)
