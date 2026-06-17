# BizManager Roadmap — Phase 1–8 (Sri Lanka Market)

Product strategy: **owner-first money + staff control + trilingual AI**, growing toward QuickBooks / Tally / Busy capability without Tally-level complexity on the owner's phone.

**Positioning:** Sri Lanka's owner app for daily money, staff, and payroll — simple like a notebook, strong enough for VAT and EPF.

---

## Current baseline (already built)

Do not rebuild these — they are the foundation for all phases.

| Area | Web | Mobile | Notes |
|------|-----|--------|-------|
| Dashboard (income, expense, cash/bank, pending) | ✅ | ✅ Home | Demo + Supabase |
| Income — add + list | ✅ | ✅ Add | No edit/delete |
| Expenses — add + list | ✅ | ✅ Add | |
| Expense receipt upload | ✅ | ❌ | Supabase Storage `attachments` |
| Income receipt upload | ✅ | ❌ | Sprint 11 |
| Customers — add, edit, list | ✅ | ❌ | Balance display |
| Suppliers — add, edit, list | ✅ | ❌ | Balance display |
| Approvals — list, detail, approve/reject | ✅ | View only | |
| Payroll — generate → submit → approve → paid | ✅ | ❌ | EPF 8% basic |
| Payslip PDF (single + batch) | ✅ | ❌ | Sprint 12 |
| Attendance — mark daily | ✅ | ❌ | |
| Leave — approve/reject | ✅ | ❌ | No apply-leave UI |
| Staff — view roster | ✅ | View only | No add/edit |
| Reports — charts + PDF/CSV + WhatsApp | ✅ | ❌ | |
| Settings — company, tax toggles, invites | ✅ | ❌ | Tax not applied to txns |
| AI — daily insight + Q&A | ✅ | ✅ | Mock default; OpenAI optional |
| Auth, onboarding, setup, RLS | ✅ | ✅ | |
| i18n EN / SI / TA | ✅ | ✅ | |
| LKR, Asia/Colombo, LankaQR, EPF fields | ✅ | ✅ | Schema + utils |

### Not built yet (gaps driving this roadmap)

- Mobile approve/reject, mobile receipts
- Staff add/edit, leave apply
- Transaction edit/delete, party delete
- Sales invoices, purchase bills, party statements
- VAT/SSCL applied to documents (settings save only today)
- Attendance → payroll deductions, advances, allowances
- Chart of accounts, journal entries, P&L, balance sheet
- Inventory / stock
- Real AI on live data, offline mobile, push notifications
- App Store / Play Store assets and listings

---

## Build order overview

```
Phase 1  →  Daily owner app (close MVP gaps)
Phase 2  →  Customer & supplier ledger (invoice/bill)
Phase 3  →  Sri Lanka tax on documents
Phase 4  →  HR + payroll depth
Phase 5  →  Hidden accounting engine (accountant mode)
Phase 6  →  Real AI (Sri Lanka–specific)
Phase 7  →  Mobile parity + offline + store
Phase 8  →  Retail / inventory (optional vertical)
```

**Dependencies:**

- Phase 2 before Phase 3 (tax needs invoice line items)
- Phase 2 before Phase 5 (journals post from invoices/payments)
- Phase 1 before Phase 7 (mobile approvals first)
- Phase 8 only if retail is the primary market

---

## Phase 1 — Complete the daily owner app

**Goal:** Owner can run daily operations from phone; close gaps in the current MVP.

**Target user:** Every SMB owner (3–25 staff).

**Competes with:** Excel notebooks + WhatsApp.

### Deliverables

| ID | Feature | Web | Mobile | Notes |
|----|---------|-----|--------|-------|
| 1.1 | Approve / reject payments | — | New | `processApproval` exists; wire to mobile |
| 1.2 | Receipt photo on income/expense | — | New | Reuse `uploadReceipt` from web |
| 1.3 | Staff add / edit | New pages | Optional read | i18n `addStaff` exists; no UI |
| 1.4 | Apply leave (submit request) | New form | New form | RLS `leave_insert` exists |
| 1.5 | Edit / delete income & expense | New | New | Add `updateTransaction`, soft delete |
| 1.6 | Delete customer / supplier | New | — | Prefer `deleted_at` soft delete |
| 1.7 | v1.4 launch assets | — | New | `icon.png`, `splash.png`, EAS store prep |

### Schema / API

```sql
-- Optional soft delete
ALTER TABLE transactions ADD COLUMN deleted_at TIMESTAMPTZ;
ALTER TABLE customers ADD COLUMN deleted_at TIMESTAMPTZ;
ALTER TABLE suppliers ADD COLUMN deleted_at TIMESTAMPTZ;
```

**New mutations:**

- `createStaff`, `updateStaff`
- `createLeaveRequest`
- `updateTransaction`, `deleteTransaction` (soft)
- `deleteCustomer`, `deleteSupplier` (soft)

### Acceptance criteria

1. Owner approves a pending rent payment from mobile.
2. Manager photographs a receipt on mobile; it appears on web.
3. Owner adds a new staff member with salary.
4. Staff member submits leave; owner approves on web.
5. Owner edits a wrong expense amount.

### Sprint mapping

| Sprint | Scope |
|--------|-------|
| **13** | 1.1 Mobile approvals + 1.2 Mobile receipts + 1.3 Staff add/edit |
| **14** | 1.4 Leave apply + 1.5 Transaction edit/delete + 1.6 Party delete + 1.7 Launch assets |

---

## Phase 2 — Customer & supplier ledger

**Goal:** Real party accounting (udhaar / receivable / payable) without full Tally UI.

**Target user:** Agencies, shops, offices with credit customers or supplier bills.

**Competes with:** Busy khata, basic QuickBooks invoicing.

### Deliverables

| ID | Feature | Description |
|----|---------|-------------|
| 2.1 | Sales invoice | Numbered invoice: customer, line items, date, due date |
| 2.2 | Record payment received | Link payment to customer; reduce `current_balance` |
| 2.3 | Customer statement | Invoices + payments; PDF + WhatsApp share |
| 2.4 | Purchase bill | Mirror of invoice for suppliers |
| 2.5 | Record payment made | Link to supplier; reduce payable |
| 2.6 | Supplier statement | PDF + WhatsApp share |
| 2.7 | Aging view | Overdue buckets (30 / 60 / 90 days) on party cards |

### Schema (new tables)

```sql
CREATE TABLE invoices (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  company_id UUID NOT NULL REFERENCES companies(id),
  customer_id UUID NOT NULL REFERENCES customers(id),
  invoice_number TEXT NOT NULL,
  invoice_date DATE NOT NULL,
  due_date DATE,
  subtotal NUMERIC(15,2) NOT NULL DEFAULT 0,
  tax_amount NUMERIC(15,2) NOT NULL DEFAULT 0,
  total NUMERIC(15,2) NOT NULL DEFAULT 0,
  amount_paid NUMERIC(15,2) NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'draft', -- draft, sent, partial, paid, cancelled
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(company_id, invoice_number)
);

CREATE TABLE invoice_lines (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  invoice_id UUID NOT NULL REFERENCES invoices(id) ON DELETE CASCADE,
  description TEXT NOT NULL,
  quantity NUMERIC(10,2) NOT NULL DEFAULT 1,
  unit_price NUMERIC(15,2) NOT NULL,
  amount NUMERIC(15,2) NOT NULL,
  sort_order INT NOT NULL DEFAULT 0
);

CREATE TABLE invoice_payments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  invoice_id UUID NOT NULL REFERENCES invoices(id),
  transaction_id UUID REFERENCES transactions(id),
  amount NUMERIC(15,2) NOT NULL,
  payment_date DATE NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- bills, bill_lines, bill_payments — mirror structure with supplier_id
```

**Link existing `transactions`:** add optional `invoice_id`, `bill_id` columns.

### Screens (web)

- `/invoices`, `/invoices/new`, `/invoices/[id]`
- `/bills`, `/bills/new`, `/bills/[id]`
- Customer detail → Invoices tab + Statement export
- Supplier detail → Bills tab + Statement export

### Acceptance criteria

1. Create invoice INV-2026-001 for Rs. 85,000 → customer balance increases.
2. Record Rs. 50,000 payment → balance Rs. 35,000; invoice status `partial`.
3. WhatsApp customer statement PDF to customer phone.

### Sprint mapping

| Sprint | Scope |
|--------|-------|
| **15** | 2.1–2.3 Invoices + customer payments + statement PDF |
| **16** | 2.4–2.7 Bills + supplier payments + aging |

---

## Phase 3 — Sri Lanka tax on documents

**Goal:** VAT-registered businesses get trustworthy tax on sales and purchases.

**Target user:** VAT-registered offices, shops, agencies.

**Competes with:** Tally VAT reports (simplified).

### Deliverables

| ID | Feature | Description |
|----|---------|-------------|
| 3.1 | VAT on invoice/bill lines | Use `company.vat_rate` (default 18%) |
| 3.2 | Tax inclusive vs exclusive | Company-level default + per-document override |
| 3.3 | SSCL on service lines | Where `sscl_enabled` |
| 3.4 | Monthly VAT summary | Output tax, input tax, net payable |
| 3.5 | VAT on quick income/expense | Optional tax field on simple entries |
| 3.6 | Accountant export | CSV/PDF tax summary by month |

### Schema

```sql
ALTER TABLE companies ADD COLUMN tax_inclusive_default BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE invoices ADD COLUMN tax_inclusive BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE invoice_lines ADD COLUMN tax_rate NUMERIC(5,2) NOT NULL DEFAULT 0;
-- Same for bills
```

**Wire existing fields:** `tax_enabled`, `vat_rate`, `sscl_enabled`, `sscl_rate` from settings into calculation service in `packages/utils`.

### Reports

- `/reports` → new tab **VAT Summary**
- Columns: taxable sales, output VAT, taxable purchases, input VAT, net VAT due

### Acceptance criteria

1. Invoice with 18% VAT shows subtotal + tax + total correctly (inclusive and exclusive modes).
2. June VAT summary matches sum of June invoices and bills.

### Sprint mapping

| Sprint | Scope |
|--------|-------|
| **17** | 3.1–3.6 Full tax engine + VAT summary report |

---

## Phase 4 — HR + payroll depth

**Goal:** Attendance, leave, and payroll work as one system — key differentiator vs pure accounting apps.

**Target user:** Businesses with 5–25 registered staff.

**Competes with:** Separate payroll spreadsheets + manual EPF calculations.

### Deliverables

| ID | Feature | Description |
|----|---------|-------------|
| 4.1 | Attendance → payroll | Absent / half-day → `no_pay_deduction` on payroll items |
| 4.2 | Staff advance | UI for `staff_advance` transactions; deduct in payroll |
| 4.3 | Allowances / overtime | Edit per staff on payroll run before submit |
| 4.4 | Leave balance | Annual / casual days remaining per staff |
| 4.5 | EPF/ETF employer report | Monthly PDF for compliance |
| 4.6 | APIT | Optional — for larger employers |
| 4.7 | Mobile attendance | Manager marks attendance on phone |

### Existing schema to use

- `payroll_items.no_pay_deduction`, `allowance`, `overtime`, `advance`, `apit`
- `transaction_type` includes `staff_advance`
- EPF rates in `mutations.ts` (`EPF_EMPLOYEE_RATE = 0.08`)

### Acceptance criteria

1. Staff absent 2 days in June → payslip shows no-pay deduction.
2. Rs. 10,000 advance in May → deducted in June payroll.
3. EPF/ETF employer report PDF exports for accountant.

### Sprint mapping

| Sprint | Scope |
|--------|-------|
| **18** | 4.1–4.5 Attendance payroll link + advances + EPF report |
| **19** | 4.6–4.7 APIT (if needed) + mobile attendance |

---

## Phase 5 — Hidden accounting engine (accountant mode)

**Goal:** Double-entry books under the hood; owner keeps simple UI.

**Target user:** Growing SMEs + external accountants.

**Competes with:** Tally / QuickBooks (accountant-facing).

### Design rule

- **Owner:** never sees journal entries in Phase 5.
- **Accountant:** Reports → Accounting section (Trial Balance, P&L, Balance Sheet).

### Deliverables

| ID | Feature | Description |
|----|---------|-------------|
| 5.1 | Chart of accounts | Cash, bank, debtors, creditors, sales, purchases, expense heads |
| 5.2 | Auto journal entries | Invoice, payment, expense auto-post debit/credit |
| 5.3 | Trial balance | By period |
| 5.4 | Profit & loss | Monthly / yearly |
| 5.5 | Balance sheet | Assets vs liabilities |
| 5.6 | Accountant export | CSV ledger for external tools |
| 5.7 | Opening balances | Setup wizard / year-start entry |

### Schema

```sql
CREATE TABLE chart_of_accounts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  company_id UUID NOT NULL REFERENCES companies(id),
  code TEXT NOT NULL,
  name TEXT NOT NULL,
  type TEXT NOT NULL, -- asset, liability, equity, income, expense
  parent_id UUID REFERENCES chart_of_accounts(id),
  is_system BOOLEAN NOT NULL DEFAULT false,
  UNIQUE(company_id, code)
);

CREATE TABLE journal_entries (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  company_id UUID NOT NULL REFERENCES companies(id),
  entry_date DATE NOT NULL,
  description TEXT,
  ref_type TEXT, -- invoice, bill, transaction, payroll, manual
  ref_id UUID,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE journal_lines (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  journal_entry_id UUID NOT NULL REFERENCES journal_entries(id) ON DELETE CASCADE,
  account_id UUID NOT NULL REFERENCES chart_of_accounts(id),
  debit NUMERIC(15,2) NOT NULL DEFAULT 0,
  credit NUMERIC(15,2) NOT NULL DEFAULT 0
);
```

### Posting examples

| Event | Debit | Credit |
|-------|-------|--------|
| Sales invoice | Debtors | Sales + VAT payable |
| Customer payment | Cash/Bank | Debtors |
| Expense (approved) | Expense | Cash/Bank |
| Payroll paid | Salary expense | Cash/Bank |

### Acceptance criteria

1. June invoice auto-creates balanced journal entry.
2. P&L for June matches manual Excel for same transactions.

### Sprint mapping

| Sprint | Scope |
|--------|-------|
| **20** | 5.1–5.2 Chart of accounts + auto-posting service |
| **21** | 5.3–5.7 Trial balance, P&L, balance sheet, opening balances |

---

## Phase 6 — Real AI (Sri Lanka–specific)

**Goal:** AI drives daily retention — not a gimmick.

**Build on:** `packages/ai` (`MockAIService`, `OpenAIService`).

### Deliverables

| ID | Feature | Description |
|----|---------|-------------|
| 6.1 | Live daily brief | Replace mock with `getDashboardSummary` + real approvals |
| 6.2 | Anomaly alerts | e.g. "Fuel +42% vs last month" on dashboard |
| 6.3 | Cash runway | "Can you pay rent + payroll on the 25th?" |
| 6.4 | SI/TA simple answers | Short sentences, Rs. format, Colombo dates |
| 6.5 | Approval risk notes | Rules + LLM on `payment_requests.ai_note` |
| 6.6 | WhatsApp AI summary | One-tap monthly brief |

### Acceptance criteria

1. Sinhala daily brief shows owner's real income/expense for today.
2. Dashboard shows warning when category spend exceeds threshold vs last month.

### Sprint mapping

| Sprint | Scope |
|--------|-------|
| **22** | 6.1–6.4 Live data AI + anomalies |
| **23** | 6.5–6.6 Approval AI + WhatsApp summary |

---

## Phase 7 — Mobile parity + offline + store

**Goal:** Phone is the primary device in Sri Lanka.

### Deliverables

| ID | Feature | Description |
|----|---------|-------------|
| 7.1 | Invoices + record payment | Mobile sales flow |
| 7.2 | Payroll view + approve | Owner approves payroll on phone |
| 7.3 | Reports summary + WhatsApp | Monthly brief share |
| 7.4 | Push notifications | Pending approval, payroll due |
| 7.5 | Offline queue | Save expense offline; sync when online |
| 7.6 | App Store / Play Store | Listings, screenshots, submit |

### Acceptance criteria

1. Owner creates invoice and records payment entirely on mobile.
2. Push notification when expense > approval limit.

### Sprint mapping

| Sprint | Scope |
|--------|-------|
| **24** | 7.1–7.3 Mobile invoice + payroll + reports |
| **25** | 7.4–7.6 Push, offline, store submit |

---

## Phase 8 — Retail / inventory (optional)

**Goal:** Busy/Tally-style stock — **only if retail is the primary market.**

**Skip** unless `business_type = retail_shop` is the hero vertical.

### Deliverables

| ID | Feature | Description |
|----|---------|-------------|
| 8.1 | Products / SKU | Name, code, unit, cost, sell price |
| 8.2 | Stock movements | Stock in (purchase), stock out (sale) |
| 8.3 | Low stock alert | Dashboard + optional push |
| 8.4 | Invoice lines → products | Deduct stock on sale |
| 8.5 | Simple POS | Fast retail checkout screen (optional) |

### Sprint mapping

| Sprint | Scope |
|--------|-------|
| **26+** | 8.1–8.5 As needed per retail decision |

---

## Sprint calendar (Sprint 13 → 25)

| Sprint | Phase | Focus |
|--------|-------|-------|
| 13 | 1 | Mobile approvals, mobile receipts, staff add/edit |
| 14 | 1 | Leave apply, transaction edit/delete, launch assets |
| 15 | 2 | Sales invoices + customer payments + statement |
| 16 | 2 | Purchase bills + supplier payments + aging |
| 17 | 3 | VAT/SSCL on documents + tax summary |
| 18 | 4 | Attendance → payroll, advances, EPF report |
| 19 | 4 | Leave balance, mobile attendance, APIT (optional) |
| 20 | 5 | Chart of accounts + auto journals |
| 21 | 5 | P&L, trial balance, balance sheet |
| 22 | 6 | Live AI brief + anomalies |
| 23 | 6 | Approval AI + WhatsApp summary |
| 24 | 7 | Mobile invoice + payroll approve |
| 25 | 7 | Push, offline sync, store submit |

---

## Priority matrix

| Phase | Name | Priority | Why |
|-------|------|----------|-----|
| 1 | Daily owner app | **Start now** | Unblocks mobile-first SL market |
| 2 | Invoice & party ledger | **High** | First real accounting step |
| 3 | SL tax | **High** | Registered businesses need VAT |
| 4 | HR + payroll depth | **High** | Your differentiator vs QB/Tally |
| 5 | Accountant engine | Medium | Needed for accountant trust |
| 6 | Real AI | Medium | Marketing + retention edge |
| 7 | Mobile + offline + store | Medium | Daily habit + distribution |
| 8 | Inventory | Low / optional | Large scope; retail-only |

---

## Sri Lanka design principles (all phases)

1. **LKR only** in v1 — `formatCurrency` with Rs. prefix.
2. **Asia/Colombo** timezone for all dates.
3. **EN / SI / TA** for every new user-facing string.
4. **WhatsApp share** on every export (invoice, statement, payslip, report).
5. **Payment methods:** cash, bank_transfer, lankaqr, cheque, card.
6. **Owner approval** for high-value spend — keep as default workflow.
7. **Accountant export** over IRD API integration in early phases.
8. **Simple owner UI** — hide journal entries until Phase 5 accountant mode.

---

## Target vertical (marketing)

**Primary:** Service + office businesses (travel agency, agency, repairs, tuition) — matches current demo and schema.

**Secondary:** Restaurant / café (daily cash + staff).

**Defer:** Full retail until Phase 8 decision.

---

## Related docs

- [architecture.md](./architecture.md) — monorepo, auth, roles
- [rls-policies.md](./rls-policies.md) — security by role
- [sprint-12.md](./sprint-12.md) — latest shipped sprint
- [setup.md](./setup.md) — local and Supabase setup

---

## Next action

**Start Sprint 13 (Phase 1):**

1. Mobile approve/reject on `apps/mobile/app/(tabs)/approvals.tsx`
2. Mobile receipt upload on `add-income.tsx` / `add-expense.tsx`
3. Web staff add/edit at `/staff/add`, `/staff/[id]/edit`
