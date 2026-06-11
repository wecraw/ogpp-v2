# OGPP — Off Grid Part Picker

**Product specification & roadmap**
_Last updated: 2026-06-10_

---

## 1. Product summary

OGPP ("Off Grid Part Picker") helps a non-expert pick an all-in-one solar
power system — EcoFlow, Jackery, Bluetti, and similar power stations — based on
the appliances they want to run off-grid and where they live. The user lists
their appliances, picks the seasons they'll use the system, and enters a ZIP
code; the app sizes the load, pulls local solar irradiance, and walks them
through choosing a compatible power station, battery bank, and solar array.

- **Audience:** RVers, van-lifers, cabin/off-grid owners, and emergency-backup
  buyers who don't know how to size a system themselves.
- **Core value:** turns "how many watts and panels do I need?" into a guided,
  compatibility-checked picker.
- **Shape:** Angular 21 single-page app, standalone components, client-side
  only. State lives in `localStorage`. The only external dependency is the NREL
  `solar_resource` API for monthly solar irradiance by ZIP.

---

## 2. Core domain model

### The Build
`Build` (`src/app/interfaces/Build.ts`) is the single document that flows
through the whole app. It carries both the user's **inputs** and their
**chosen gear**:

| Field | Meaning |
|---|---|
| `appliances[]` | Selected appliances (each has `wattage`, `hours`, `quantity`, `applianceGroup`) |
| `seasons[]` | Which of winter/spring/summer/fall the system must cover |
| `zipCode` | Location, used for the solar lookup |
| `monthlyGhi` | Per-month global horizontal irradiance from NREL |
| `inverter` | The chosen all-in-one power station (see terminology note) |
| `batteries[]` | Chosen battery units — **one array entry per physical unit** |
| `powerSources[]` | Solar panels, modeled as `PowerSource` — also one entry per unit |
| `id`, `name`, `createdOn`, `lastEdited` | Identity / metadata |

**Terminology gotcha:** "Inverter" here means the **all-in-one power station**
(e.g. DELTA Pro 3), not a bare DC→AC converter. It carries `maxOutput`,
`maxSolarInput`, `batteryCapacity`, `compatibleBatteries`, and `maxBatteries`.
Solar panels are modeled as `PowerSource`, not as inverters.

### Stable content IDs
Product/appliance catalogs are hand-curated arrays in `src/app/content/*.ts`.
IDs are **content-derived slugs** assigned at load time (`catalog-utils.ts`),
so reordering or inserting catalog entries never re-maps a build that's already
saved in `localStorage`.

### Current catalog size (seed data)
- **Appliances:** 6 items across 2 groups (Kitchen, Entertainment)
- **Power stations / inverters:** 3 (EcoFlow, Jackery, Bluetti — one each)
- **Batteries:** 4
- **Solar panels:** 6

---

## 3. User flow & pages

Three routes (`app.routes.ts`); default redirect to `/builder`. Pages hand the
build to each other **only via the `?buildId=` query param**, re-loading from
`localStorage` on each `ngOnInit` — there is no shared in-memory store.

### `/builder` — the wizard
- Step 1: pick appliances, pick seasons, enter ZIP.
- Computes **live `peakWattage`** (Σ wattage × qty) and **`totalWattHours`**
  (× hours) as the user edits.
- On submit: fetches sun-hours from NREL, assigns the build a `uuid`, saves to
  `localStorage`, and routes to `/build?buildId=…`.

### `/build` — the recommender
A three-step progressive flow:
1. **Inverter / power station** — filtered to units whose `maxOutput ≥
   peakWattage`.
2. **Batteries** — sized to cover load, brand-matched to the chosen station
   (falls back to full catalog if that brand has none). Autonomy is **hardcoded
   to 1 day** (`DAYS_OF_AUTONOMY`).
3. **Solar** — sized against `wattageNeeded` (watt-hours ÷ seasonal sun-hours),
   brand-matched to the station.

Each step reveals progressively and shows live compatibility in a stacked
bottom bar. Selections auto-save on every change and restore on reload.
Quantities are stored as **duplicate array entries** (2× a panel = two
entries). A **Finish** button — gated on all three steps being compatible —
routes to `/builds`.

### `/builds` — saved builds
Intended saved-builds list. **Currently an empty placeholder** — builds
accumulate in `localStorage` but there's no UI to list, reopen, or delete them.

---

## 4. The sizing logic (`CalculationUtilsService`)

- `peakWattage` — Σ (wattage × quantity); drives power-station `maxOutput` match.
- `totalWattHours` — Σ (wattage × quantity × hours); drives battery sizing.
- `getSunHoursBySeason` — maps selected seasons → months → the **minimum**
  monthly GHI (worst-case month in the chosen seasons).
- `wattageNeeded` — watt-hours ÷ sun-hours; the solar-array target.

Supporting services:
- **`BuildService`** — CRUD in `localStorage`, keyed `build_<id>`.
- **`SunHoursService`** — NREL lookup by ZIP. _API key is hardcoded._
- **`ProductSelectorService`** — `getMatchingInverters`,
  `getMatchingBatteries`, `getMatchingSolarPanels` (brand-match w/ catalog
  fallback).

---

## 5. Current state & known gaps

This project was **picked back up from a stale state**; several features are
not wired end to end.

| Gap | Detail | Impact |
|---|---|---|
| **`/builds` is empty** | No list/reopen/delete UI; Finish dead-ends | User can't manage or revisit saved builds |
| **Debug bypass on** | `BuilderComponent.debug = true` stubs `monthlyGhi` to all-1s, skipping NREL | Solar sizing is unrealistic until turned off |
| **Autonomy hardcoded** | `DAYS_OF_AUTONOMY = 1`, no user override | Can't size for multi-day off-grid use |
| **`maxBatteries` per-model** | Enforced per battery model, not as a bank total | Breaks if a brand ever has multiple battery models |
| **Hardcoded NREL key** | In `SunHoursService` | Must move out before any deployment |
| **Stale spec tests** | 5 auto-generated `should create` specs fail | No real test coverage on components |
| **Thin catalogs** | 3 stations / 4 batteries / 6 panels / 6 appliances | Not enough breadth for real recommendations |
| **No persistence beyond localStorage** | No accounts, no cross-device | Builds are trapped on one browser |

---

## 6. Roadmap — high-priority features

Ordered by a rough value-vs-effort read. Tiers 1–2 make the app actually
usable end to end; tier 3 grows it into a real product.

### Tier 1 — Make the happy path real (unblock the core loop)

1. **Build the `/builds` page.** List saved builds (name, date, key specs),
   reopen into `/build`, rename, duplicate, delete. This is the missing end of
   the flow — Finish currently dead-ends.
2. **Turn off the debug bypass & harden the NREL path.** Set `debug = false`,
   move the API key to environment config, and handle lookup failure
   gracefully (bad ZIP, timeout, no data) with a user-visible fallback.
3. **Build summary + buy/deal screen.** A clear final recap: total price, total
   output, total capacity, total panel wattage, and a parts list — each with an
   **affiliate buy-link**. Surface the in-brand **bundle/deal** and a "save $X
   vs. buying separately" callout. This is both the payoff of the flow and the
   primary monetization surface, so it lands in Tier 1.

### Tier 2 — Make recommendations trustworthy

4. **User-configurable days of autonomy.** Expose `DAYS_OF_AUTONOMY` in the UI;
   battery sizing is meaningless for real off-grid use without it.
5. **Expand the catalogs.** More stations, batteries, and panels across the
   three brands (plus more appliances with sensible default wattages/hours).
   The matching logic is fine; it's starved of data.
6. **Explain the math.** Inline "why this size?" tooltips/breakdowns (peak
   watts, daily Wh, worst-season sun-hours). Builds trust and reduces support
   questions.
7. **Fix or delete the stale component specs** and add real unit tests for
   `CalculationUtilsService` and `ProductSelectorService` — the sizing math is
   the product and is currently untested.

### Tier 2.5 — Deal-finding (monetization core)

8. **Price + bundle data in the catalog.** Add price, active-discount, and
   in-brand bundle fields; populate from a live or periodically-refreshed
   source. Foundation for everything deal-related.
9. **Bundle-aware, in-brand recommendations.** Prefer brand kits (station +
   battery + panels) when cheaper than à-la-carte; keep all parts in the chosen
   brand by design (see Decision #2).

### Tier 3 — Grow into a product

10. **Price watching & drop alerts.** Track price history on a saved build;
    flag drops and (later) notify when a watched build's parts go on sale.
11. **On-site display ads.** Secondary revenue stream alongside affiliate links.
12. **Appliance presets & custom appliances.** "RV kit," "CPAP + phones,"
    "cabin weekend" starting points, plus a custom-appliance entry form.
13. **Shareable build links.** Encode/share a build by URL (still
    `localStorage`-backed — no accounts; see Decision #3).
14. **Responsive / mobile polish & onboarding.** This is a buying-decision tool
    people will use on a phone in a store or driveway.

---

## 7. Product decisions (resolved)

These were open questions; they're now settled and drive the roadmap above.

1. **Monetization = affiliate buy-links and/or on-site ads.** Every catalog
   item links out to purchase via affiliate links; on-site display ads are a
   secondary revenue stream. This makes **pricing, buy-links, and deal-finding
   first-class** product surfaces, not afterthoughts.

2. **Single-brand builds are the intended design, not a limitation.** Once the
   user settles on a core "solar generator" (the power station), batteries and
   solar should **stay within that brand** — even when cross-brand parts are
   compatible on paper. Rationale: single-brand systems are more reliable in
   practice, and brands bundle/discount their own ecosystem, so the **best
   deals come from staying in-brand**. The existing brand-match logic in
   `ProductSelectorService` already reflects this; lean into it rather than
   building mixed-vendor support.

3. **`localStorage` is fine for v1.** No accounts needed. Shareable build links
   remain a nice-to-have for later, but cross-device persistence is out of
   scope for now.

4. **Static-first, backend later.** A backend *is* planned, but the near-term
   goal is to **refine the core experience as a static webpage** before
   introducing one. Implication for sequencing:
   - Tiers 1–2 ship **fully static** — no backend required.
   - Deal-finding (Tier 2.5) starts with **static/curated pricing** (manually
     refreshed or build-time-fed into the catalog). Live pricing, price
     history, and alerts are explicitly **deferred to the backend phase**, not
     a reason to introduce a backend early.
   - When the backend does land, it picks up: live/refreshed pricing, price
     watching & drop alerts (#10), and optionally cloud-synced builds.

### Deal-finding (new first-class theme)

Because the business is affiliate-driven and brand-locked, **finding the best
deal within the chosen brand** is core product value, not a nice-to-have:

- Surface current price and any active discount/bundle for each recommended
  part.
- Prefer **brand bundles** (station + battery + panel kits) over à-la-carte
  when they're cheaper than the sum.
- Highlight savings ("save $X vs. buying separately") at the build-summary
  step.
- Longer term: track price history / flag price drops on a saved build, and
  notify when a watched build's parts go on sale.

This theme touches the catalog (needs price/bundle/discount fields and live or
periodically-refreshed pricing), the recommender (bundle-aware matching), and
the build summary (savings callouts) — see Tier 1 #3 and Tier 3 #9 above.
