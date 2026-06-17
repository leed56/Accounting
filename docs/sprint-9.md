# Sprint 9 — Production Launch Checklist

## Done in code
- Customer / supplier add forms (`/customers/add`, `/suppliers/add`)
- Receipt upload on expense form (Supabase Storage `attachments` bucket)
- Payroll generate → submit → approve → mark paid
- Auth guard + loading state on web
- Mobile real Supabase login
- Approval / attendance query invalidation + toasts

## One-time setup (run locally)

```bash
pnpm db:storage    # create attachments bucket
```

## Vercel production

1. **GitHub → Vercel:** [Settings → Git](https://vercel.com/yasu-s-projects3/accounting/settings/git) → connect `leed56/Accounting`
2. **Root Directory:** `apps/web`
3. **Supabase Auth URLs:** add `https://accounting-one-fawn.vercel.app/**` as redirect

## Smoke test (production)

1. Login: `appleview778@gmail.com`
2. Add expense > Rs. 6,000 → appears in Approvals
3. Approve → cash balance updates on dashboard
4. Add customer → shows in Customers list
5. Generate payroll → Submit → Approve → Mark paid

## Rotate secrets (if exposed in chat)
- Vercel token, Supabase service role, DB password
