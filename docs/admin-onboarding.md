# Admin — onboard a new customer

Use this when someone is interested and you want to give them **email + password** to log in.

## Prerequisites

- `supabase/.env.local` with `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY`
- Migrations applied: `pnpm db:migrate`

## One command

```bash
pnpm admin:create-company <email> "<owner name>" "<business name>" <business_type> [password] [language]
```

### Example — tuition class

```bash
pnpm admin:create-company owner@gmail.com "Nimal Perera" "Shakthi Maths Academy" tuition_education
```

### Example — shop with custom password

```bash
pnpm admin:create-company shop@gmail.com "Sunil" "Sunil Stores" retail_shop Shop2026!
```

## Business types

| Type | For |
|------|-----|
| `retail_shop` | Kade, boutique, hardware |
| `restaurant_cafe` | Restaurant, bakery |
| `salon_beauty` | Salon, barber |
| `tuition_education` | Tuition, coaching |
| `transport_hire` | Van, three-wheel |
| `construction_contractor` | Builder |
| `workshop_repair` | Auto / phone repair |
| `travel_agency` | Travel desk |
| `office_admin` | Office, NGO |
| `freelancer_agency` | Design, dev agency |
| `service_business` | Cleaning, laundry, etc. |
| `other` | Anything else |

## What the script creates

1. Supabase auth user (if email is new) with temp password
2. Company row with chosen business type
3. Owner profile linked to company
4. Cash + Bank accounts
5. Expense + income category templates for that business type

## What to send the customer

```
BizManager login:
URL: https://accounting-one-fawn.vercel.app/login
Email: owner@gmail.com
Password: (from script output)

Please change your password after first login (ask admin for reset if needed).
```

## If email already has a company

Script stops with an error. Use **Settings → Invite team member** (owner) for extra users on the same company.

## Other scripts

| Command | Purpose |
|---------|---------|
| `pnpm db:link-owner email "Name"` | Link user to **demo** Royal Travels only |
| `pnpm db:invite email "Name" manager` | Add user to demo company as manager |
| `pnpm db:seed` | Refresh demo sample data |
