# Business types — customer-first strategy

BizManager does **not** mirror government MSME sector codes. We pick business types by one question:

> **Will this owner record daily cash differently — and feel the app was built for them on day one?**

If yes → add a type with **ready-made expense categories**. If no → map to an existing type or `other`.

---

## What makes customers stay (subscription value)

| Pain today | How BizManager helps | Why they pay |
|------------|----------------------|--------------|
| Notebook + WhatsApp for cash | One place for income, expense, balance | Less chaos, fewer mistakes |
| Wrong expense labels | Categories match their words (Fuel, Building Materials, Tyres) | Reports make sense without an accountant |
| Owner always approving payments | Approval limits + notifications | Control without being at the shop |
| Staff salary confusion | Attendance + payroll in same app | End-of-month less stressful |
| “Is my business OK today?” | Dashboard + AI briefing | Peace of mind |

**Business type choice is the first “aha” moment** — if categories feel wrong, they churn before payroll.

---

## Our 18 types (June 2026)

Ordered for setup — **most common Sri Lankan micro businesses first**:

| Type | Who it's for | Why we added it |
|------|----------------|-----------------|
| `grocery_kade` | Mini supermarket, fresh produce kade | Dedicated grocery categories |
| `retail_shop` | Boutique, hardware counter | Largest trade segment |
| `textile_shop` | Saree, fabric, clothing retail | Fabric & alteration costs |
| `multi_vendor` | Marketplace, multi-supplier traders | Vendor settlements & commission |
| `restaurant_cafe` | Restaurant, bakery, kade kitchen | Food cost is daily |
| `salon_beauty` | Salon, barber, spa, cosmetics | Product + supply costs |
| `pharmacy` | Pharmacy, medical counter | Stock + compliance |
| `tuition_education` | Tuition, coaching | Materials + classroom rent |
| `transport_hire` | Three-wheel, taxi, van | Vehicle costs dominate |
| `construction_contractor` | Builder, mason | Materials + subcontractors |
| `workshop_repair` | Auto, phone, AC repair | Spare parts + job materials |
| `guesthouse` | Guesthouse, homestay, lodge | Room revenue + OTA fees |
| `agriculture` | Farm, livestock, produce seller | Seed, feed, market transport |
| `travel_agency` | Tour desk (Royal Travels) | Original demo customer |
| `office_admin` | Accountant, lawyer, NGO | Software + professional services |
| `freelancer_agency` | Design, dev, marketing | Subcontractors + software |
| `service_business` | Cleaning, laundry, etc. | Catch-all for services |
| `other` | Anything else | Custom categories in Settings |

---

## What we deliberately skip (for now)

- **Pure trading / import-only** — gov schemes often exclude; our value is ops + staff, not stock ledger
- **Agriculture / apparel / pharmacy as separate types** — Tier 2 when we have paying users in those segments
- **50+ industry codes** — hurts onboarding; owners can't find themselves

---

## Product rules going forward

1. **Add a type only when** ≥3 real users (or one paying pilot) ask for the same wording.
2. **Each type needs** 8 core + 3–4 extra categories that match how *they* talk (not IRD or DCS labels).
3. **Step 4 income categories** unlock more value for transport, tuition, travel (hire trip vs tour booking).
4. **Setup shows** plain-language label + one-line description + category preview chips.
5. **Settings → Add missing template categories** lets existing companies upgrade without re-signup.

---

## Next gaps (when customers ask)

- ~~Income templates by type~~ ✅
- ~~Guesthouse / homestay~~ ✅ `guesthouse`
- ~~Pharmacy~~ ✅ `pharmacy`
- ~~Agriculture~~ ✅ `agriculture`
- ~~Grocery / textile / multi-vendor dedicated types~~ ✅
- Push notification delivery pipeline (tokens stored; Expo send TBD)
- Full Sinhala/Tamil PDF font embedding (labels localized; Helvetica for body)

See also: [categories-roadmap.md](./categories-roadmap.md)
