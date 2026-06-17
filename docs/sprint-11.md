# Sprint 11 — v1.2 Edit, Receipts, Settings

## Done in code

- Customer / supplier **edit** forms (`/customers/[id]/edit`, `/suppliers/[id]/edit`)
- **Income receipt upload** on web (same as expenses)
- **Settings save** → persists company profile to Supabase (owner only)
- **Mobile session** → sets `companyId` from profile after login

## Smoke test

1. Customers → pencil icon → edit name/phone → save
2. Suppliers → edit → save
3. Income → Add → attach receipt → save
4. Settings → change approval limit → Save (owner)
5. Mobile → login → add expense → appears in web

## Next (v1.3)

- EAS build for iOS/Android
- Batch payslip PDF download
- Email invite instead of temp password
- Trilingual UI polish
