# BizManager / Smart Business Suite — Implementation Plan

> Original plan created at project start. See [Progress Update](#progress-update-post-mvp) for sprints completed after MVP.

## 1. Product Summary

**BizManager** is a premium, simple business management suite for Sri Lankan small businesses (1–3 active users per company). It replaces scattered notebooks, WhatsApp messages, and basic spreadsheets with one calm, trustworthy app for daily operations: income, expenses, staff attendance/leave/salary, payment approvals, receivables/payables, summaries, and AI-assisted insights.

**Product promise:** "Manage your small business from your phone — income, expenses, staff, salary, leave, approvals, and AI summaries in one simple app."

**Platforms:** Expo React Native (mobile), Next.js (responsive web), Supabase (PostgreSQL, Auth, Storage, RLS).

**MVP constraint:** Owner-friendly, not accountant-heavy. No double-entry accounting, no tax filing, no inventory/POS. Foundation designed to grow.

---

## 2. Target Users

| Persona | Context | Primary needs |
|---------|---------|---------------|
| **Owner (Kasun)** | Royal Travels Office, 4 staff | Dashboard at a glance, approve payments/salary/leave, cash visibility, AI daily briefing |
| **Manager/Accountant (Nimal)** | Records daily income/expenses, marks attendance | Fast entry forms, prepare payroll, create payment requests, limited reports |
| **Staff (optional MVP)** | Driver, assistant | View own attendance/salary, request leave, expense claims — **manual management by owner/manager is sufficient for MVP** |

**Business types:** 12 customer-first presets (shop, restaurant, salon, tuition, transport, construction, workshop, travel, office, agency, general service, other) — see [business-types-strategy.md](./business-types-strategy.md).

---

## 3. MVP Scope

### In MVP
- Auth (email/password), company onboarding, language selection (EN/SI/TA)
- Owner dashboard with metrics, charts, AI insight card, recent activity
- Income & expense CRUD with categories, payment methods, receipt attachments
- Customers (receivables) and suppliers (payables) with balances
- Staff list, attendance (manual), leave requests, basic payroll run
- Payment approval workflow with configurable limits and risk badges
- AI assistant UI + service abstraction with **mock/rule-based responses** (real LLM only if env key present)
- Reports: daily/weekly/monthly summaries, category breakdown, attendance, salary, receivables/payables
- Settings: business profile, language, currency, tax toggles (VAT/SSCL), approval limits, roles
- Audit logs for financial and approval actions
- Sample seed data (Royal Travels Office)
- Responsive web dashboard + mobile bottom nav
- Notification-ready data structure (no push in MVP)

### Explicitly Out of MVP
- Full double-entry accounting, tax filing, EPF/ETF online submission
- Inventory, multi-branch, POS, bank feeds, payment gateway, e-commerce
- Biometric/GPS attendance, staff self-service login (optional defer)
- Subscription billing (placeholder structure only)

> **Note:** PDF/Excel export and WhatsApp share were originally out of MVP scope; delivered in Sprint 10.

---

## 4. Later Features (Post-MVP Roadmap)

| Phase | Features |
|-------|----------|
| **v1.1** | PDF payslips, PDF/Excel report export, WhatsApp share links | ✅ Done (Sprint 10) |
| **v1.2** | Staff login, expense claims, push notifications | Partial — mobile session, push scaffold (Sprint 11–13) |
| **v1.3** | Phone OTP auth, LankaQR payment references, cheque lifecycle | Deferred — replaced by batch payslips, EAS, email invites (Sprint 12) |
| **v1.4** | Premium polish: welcome hero, notifications, login, offline, app icon | ✅ Done (Sprint 13) |
| **v1.5** | Global search, notification prefs, dark mode, accountant role | ✅ Done (Sprint 14) |
| **v2.0** | Real LLM integration, voice input, smart categorization |
| **v2.1** | Multi-branch, inventory-lite, POS integration |
| **v3.0** | Subscription plans, payment gateway, accountant portal |

---

## 5. Sri Lanka Market Additions

### MVP (simple, configurable)
- **Currency:** LKR default; format `Rs. 125,750` via shared formatter in `packages/utils`
- **Payment methods enum:** cash, bank_transfer, card, cheque, lankaqr, online, other
- **Tax settings:** VAT on/off + rate, SSCL on/off + rate, service charge %, disclaimer text
- **Payroll fields:** basic, allowances, overtime, advances, deductions, no-pay leave, EPF/ETF/APIT
- **Expense category presets** per business template
- **Business templates** at onboarding
- **Date/time:** Asia/Colombo timezone; locale-aware display via i18n
- **Cash-heavy workflow:** separate cash vs bank account balances; approval rules
- **Low connectivity:** React Query stale/cache, skeleton loading

### Later
- LankaQR deep links, cheque cleared/pending status, WhatsApp invoice/reminder templates, Sinhala/Tamil PDF fonts

---

## 6. App Architecture

```
Client Apps (Expo Mobile + Next.js Web)
        ↓
Shared Packages (design-tokens, i18n, types, utils, supabase-client, ai)
        ↓
Supabase (Auth, PostgreSQL + RLS, Storage)
```

### Client architecture (both apps)
- **Routing:** Expo Router (mobile), Next.js App Router (web)
- **Data:** TanStack Query + Zustand
- **Forms:** React Hook Form + Zod
- **Auth:** Supabase session; protected route groups
- **API boundary:** Direct Supabase client + RLS

### AI architecture
- `packages/ai` — `MockAIService` (default) + optional `OpenAIService`
- AI never writes financial data without user confirmation

---

## 7. Folder Structure

```
bizmanager/
├── apps/
│   ├── mobile/                 # Expo, Expo Router
│   └── web/                    # Next.js 15 App Router
├── packages/
│   ├── design-tokens/
│   ├── i18n/                   # EN, SI, TA
│   ├── types/
│   ├── utils/
│   ├── supabase-client/
│   └── ai/
├── supabase/migrations/
├── docs/
├── package.json
├── pnpm-workspace.yaml
└── turbo.json
```

---

## 8. Database Schema

### Core tables
- **companies** — business profile, tax settings, approval limits
- **profiles** — auth users linked to company (owner, manager, staff)
- **staff** — employee records
- **customers / suppliers** — receivables / payables
- **accounts** — cash and bank balances
- **transactions** — income, expense, salary, etc.
- **expense_categories** — seeded per template
- **attendance / leave_requests**
- **payroll_runs / payroll_items**
- **payment_requests** — approval workflow
- **attachments** — receipt storage
- **ai_insights / audit_logs / notifications**

### Key enums
- transaction_type, transaction_status, attendance_status, leave_status
- payroll_status, payment_request_type, risk_level, user_role

---

## 9. RLS & Security Plan

- Every table has `company_id`; RLS enabled
- Client uses **anon key only**; service role server-side only
- Helper functions: `get_user_company_id()`, `get_user_role()`, `is_owner()`
- Only owner can approve payroll and high-value payments
- Storage bucket `attachments` scoped by company

---

## 10. Screen Map

### Mobile
| Route | Screen |
|-------|--------|
| `/onboarding` | Language + product promise |
| `/login` | Email/password |
| `/(tabs)/home` | Dashboard |
| `/(tabs)/finance` | Finance overview |
| `/add-income`, `/add-expense` | Quick entry |
| `/(tabs)/staff` | Staff |
| `/(tabs)/approvals` | Approvals |
| `/(tabs)/ai` | AI assistant |

### Web
| Route | Screen |
|-------|--------|
| `/dashboard` | Owner dashboard |
| `/income`, `/expenses` | Finance |
| `/customers`, `/suppliers` | Receivables/payables |
| `/staff`, `/attendance`, `/leave`, `/payroll` | Staff module |
| `/approvals` | Payment approvals |
| `/ai` | AI panel |
| `/reports` | Reports |
| `/settings` | Settings |

---

## 11. Responsive UI Plan

- Breakpoints: sm 640, md 768, lg 1024, xl 1280, 2xl 1536
- Dashboard: 12-column grid; metric cards + charts
- Lists: table on desktop, cards on mobile
- Min tap target 44px; focus rings on web

---

## 12. Design System

- Primary green `#16A34A`, expense red `#EF4444`, analytics blue `#3B82F6`
- Background `#FAFBFC`, card radius 16px, soft shadows
- Typography: Inter; Sinhala/Tamil fallbacks
- Charts: Recharts (web)

---

## 13. Component List

**Layout:** AppShell, Sidebar, BottomNav, TopBar  
**Data:** MetricCard, SummaryCard, TransactionCard, ApprovalCard, StatusBadge  
**Forms:** FormInput, CurrencyInput, SelectField, PremiumButton  
**Feedback:** EmptyState, Toast  
**AI:** AIChatPanel, InsightCard  

---

## 14. Development Phases

| Phase | Deliverables | Status |
|-------|--------------|--------|
| **1. Foundation** | Monorepo, tokens, i18n, Supabase, auth, shells, seed | ✅ Done |
| **2. Dashboard** | Metrics, charts, AI card, activity feed | ✅ Done |
| **3. Finance** | Income/expense, customers, suppliers, attachments | ✅ Done |
| **4. Staff** | Staff, attendance, leave, payroll | ✅ Done |
| **5. Approvals** | Payment requests, workflow, audit logs | ✅ Done |
| **6. AI** | Chat UI, mock service | ✅ Done |
| **7. Reports & Settings** | Summaries, tax/approval settings | ✅ Done |
| **8. Polish** | Empty states, responsive QA | ✅ Done |

**MVP estimate:** ~10 weeks — **completed**

---

## 15. First Sprint Tasks (Phase 1)

1. Initialize pnpm monorepo + Turborepo
2. Create shared packages (tokens, i18n, types, utils)
3. Scaffold mobile (Expo) and web (Next.js)
4. Supabase migrations + RLS
5. Auth + onboarding + company setup
6. AppShell + navigation
7. Royal Travels seed data
8. `docs/setup.md`

### Env vars
```
NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY
EXPO_PUBLIC_SUPABASE_URL
EXPO_PUBLIC_SUPABASE_ANON_KEY
SUPABASE_SERVICE_ROLE_KEY    # server/scripts only
OPENAI_API_KEY               # optional
```

---

## 16. Key Workflows

### Add expense
1. Submit form → Zod validate
2. If amount ≤ auto-limit → approved; else pending + payment_request
3. Owner approves → balance update + audit log

### Payroll
1. Generate payroll_items (EPF 8%, employer rates)
2. Submit → payment_request
3. Owner approves → mark paid

### Dashboard
- React Query `useDashboardSummary(companyId, period)`
- Mock AI daily insight on load

---

## 17. Assumptions

- Monorepo with shared tokens (not shared RN/Web UI)
- Staff self-login deferred in MVP
- Cash + Bank accounts seeded at setup
- Single company per user in MVP
- Mock AI default; OpenAI optional

---

## 18. Success Criteria for MVP

- ✅ Owner onboards, sees Royal Travels dashboard in LKR
- ✅ Income/expense with approval workflow
- ✅ Attendance, leave, payroll end-to-end
- ✅ AI chat with mock responses
- ✅ Web + mobile responsive
- ✅ RLS company isolation

---

## Progress Update (Post-MVP)

### Infrastructure (live)
| Item | Status |
|------|--------|
| Supabase project connected | ✅ `kghioyrzewxjvlmrtdjh` |
| GitHub `leed56/Accounting` | ✅ |
| Vercel production | ✅ https://accounting-one-fawn.vercel.app |
| Demo login | `appleview778@gmail.com` |

### Sprint 9 — Production launch
- Customer/supplier add forms
- Receipt upload (expenses)
- Payroll generate → submit → approve → paid
- Auth guard + mobile login
- Docs: `docs/sprint-9.md`

### Sprint 10 — v1.1 Export & Team
- PDF payslips (per staff)
- Report PDF + CSV export
- WhatsApp share
- Team invites (Settings + API)
- Mobile add income/expense
- Docs: `docs/sprint-10.md`

### Sprint 11 — v1.2 Edit & Settings
- Customer/supplier **edit** forms
- Income receipt upload
- Settings save to Supabase
- Mobile company session bootstrap
- Docs: `docs/sprint-11.md`

### Sprint 12 — v1.3 Launch prep
- **Batch payslip PDF** (all staff, one file)
- **Email invites** (Supabase inviteUserByEmail)
- **EAS build config** (`apps/mobile/eas.json`)
- SI/TA translation polish
- Auth loading screen fix
- Docs: `docs/sprint-12.md`

### Sprint 13 — v1.4 Premium Polish
- Welcome hero + quick actions (web dashboard)
- Notifications panel (bell icon, mark read)
- Premium login split layout
- Mobile offline banner + push scaffold
- App icon assets (`apps/mobile/assets/icon.png`)
- Docs: `docs/sprint-13.md`, `docs/app-store-listing.md`

### Sprint 14 — v1.5 Search & Roles
- Global search (customers, suppliers, transactions, staff)
- Notification preferences in Settings
- Dark mode toggle
- Accountant read-only role + `usePermissions` hook
- Docs: `docs/sprint-14.md`

### Sprint 15 — v1.6 Mobile Search & Polish
- Mobile global search screen
- Notification filtering by user preferences
- Full dark mode polish (sidebar, charts, notifications)
- Docs: `docs/sprint-15.md`

### Sprint 16 — v1.7 Mobile Settings
- Mobile settings screen (language, dark mode, notification prefs)
- Persisted prefs via AsyncStorage
- Dark theme on home, search, tab bar
- Docs: `docs/sprint-16.md`

### Post-MVP roadmap — status
| Version | Status |
|---------|--------|
| v1.1 PDF/WhatsApp/export | ✅ Done |
| v1.2 Mobile forms, settings save | ✅ Mostly done |
| v1.3 OTP/LankaQR/cheque | ⏸ Deferred |
| v1.4 Premium polish | ✅ Done |
| v1.5 Search, prefs, dark mode, accountant | ✅ Done |
| v1.6 Mobile search, notification filter, dark polish | ✅ Done |
| v1.7 Mobile settings + persisted dark/prefs | ✅ Done |

### Next — v1.8
- Income categories (Step 4)
- Dark theme on all mobile tabs
- Mobile notifications list
- Phone OTP auth (optional)
- App Store submit (`eas init` → `pnpm mobile:build`)

### Manual checklist (still open)
- [ ] Connect GitHub to Vercel for auto-deploy
- [ ] Supabase redirect URL: `https://accounting-one-fawn.vercel.app/**`
- [ ] Rotate secrets shared during setup
- [ ] Add `NEXT_PUBLIC_APP_URL` on Vercel (invite emails)
- [ ] Enable Supabase email templates for invites

---

## Related docs

- [Setup Guide](./setup.md)
- [Architecture](./architecture.md)
- [RLS Policies](./rls-policies.md)
- [Vercel Deploy](./vercel-deploy.md)
- [Sprint 9](./sprint-9.md) · [Sprint 10](./sprint-10.md) · [Sprint 11](./sprint-11.md) · [Sprint 12](./sprint-12.md) · [Sprint 13](./sprint-13.md) · [Sprint 14](./sprint-14.md) · [Sprint 15](./sprint-15.md) · [Sprint 16](./sprint-16.md)
- [App Store Listing](./app-store-listing.md)
