# Expense categories — step-by-step plan

BizManager uses **simple expense tags** (not a full chart of accounts). Categories group spending for reports, approvals, and AI summaries.

## Step 1 — Full default list ✅ (this sprint)

- **8 core categories** for all businesses: Rent, Fuel, Electricity, Internet, Stationery, Maintenance, Salaries, Other
- **+3 travel extras** for `travel_agency`: Vehicle Maintenance, Marketing, Parking & Tolls
- Wired into: demo mode, `createCompany`, `pnpm db:seed`

**Your live DB:** run once to add missing categories:

```bash
pnpm db:seed
```

Or in Supabase SQL — only inserts missing names (safe to re-run logic via seed script).

## Step 2 — Settings UI ✅

- Settings → **Manage expense categories**
- Owner can add / rename / hide (not delete if used in transactions)
- Migration: `is_hidden` column on `expense_categories`

## Step 3 — Business templates ✅

- **Retail** (+4): Inventory, Packaging, Delivery, Shop Supplies
- **Restaurant / Café** (+4): Food Ingredients, Kitchen Supplies, Gas (LPG), Cleaning
- **Office / Admin** (+3): Software, Professional Services, Travel
- **Service business** (+3): Tools & Equipment, Transport, Client Entertainment
- **Freelancer / Agency** (+3): Software, Subcontractors, Marketing
- **Travel agency** (+3): Vehicle Maintenance, Marketing, Parking & Tolls
- Setup page shows live category preview; `createCompany` seeds by `business_type`
- Settings → **Add missing template categories** for existing companies

## Step 4 — Income categories (next)

- Separate list for income (Tour Booking, Transfer, etc.)
- Mirror expense pattern on income add form

## Step 5 — Reports polish (later)

- Category breakdown chart uses full list
- SI/TA labels on reports

---

## Reference: Royal Travels (travel_agency) — 11 categories

| Category | Use |
|----------|-----|
| Rent | Office rent |
| Fuel | Vehicle fuel |
| Electricity | CEB bill |
| Internet | Dialog/SLT |
| Stationery | Office supplies |
| Maintenance | General repairs |
| Salaries | Non-payroll cash wages (optional) |
| Vehicle Maintenance | Garage, tyres |
| Marketing | Ads, flyers |
| Parking & Tolls | Daily ops |
| Other | Everything else |

Payroll runs stay in **Payroll** module — salary category is optional for petty cash wages only.
