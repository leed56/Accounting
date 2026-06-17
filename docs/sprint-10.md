# Sprint 10 — v1.1 Export & Team

## Done in code

- **PDF payslips** — per-staff download on Payroll page
- **Report export** — PDF + CSV (Excel-compatible) on Reports page
- **WhatsApp share** — payslip summary + business report summary
- **Team invites** — Settings → User Roles (owner only, max 3 users)
- **Mobile forms** — Add Income / Add Expense from Finance tab

## Dependencies

- `jspdf` in `apps/web` for PDF generation

## Vercel env (for web invites)

Add to Vercel project (server-only, not `NEXT_PUBLIC`):

```
SUPABASE_SERVICE_ROLE_KEY=<your service role key>
```

Redeploy after adding.

## CLI invite (alternative)

```bash
pnpm db:invite manager@example.com "Nimal Silva" manager
```

## Smoke test

1. **Payroll** → Generate → PDF download for one staff member
2. **Payroll** → WhatsApp button opens wa.me with payslip text
3. **Reports** → Export PDF and Export Excel (CSV)
4. **Reports** → WhatsApp shares summary
5. **Settings** → Invite manager (owner only) → copy temp password
6. **Mobile** → Finance → Add Income / Add Expense → saves to Supabase

## Next (v1.2)

- Customer/supplier edit forms
- Income receipt upload on web
- EAS build + App Store / Play Store prep
- GitHub ↔ Vercel auto-deploy (connect repo in dashboard)
