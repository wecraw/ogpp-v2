# OGPP Product Catalog Model

Verified against the codebase. Field names and behaviors below are exact.

## Key Files

| Concern | File |
| --- | --- |
| Power stations ("inverters") | `src/app/content/inverters.ts` |
| Expansion batteries | `src/app/content/batteries.ts` |
| Solar panels (`PowerSource`) | `src/app/content/solarPanels.ts` |
| Vendor bundle offers | `src/app/content/product-bundle-offers.ts` |
| Stable-ID assignment | `src/app/content/catalog-utils.ts` |
| Shared pricing fields | `src/app/interfaces/ProductPricing.ts` |
| Power station schema | `src/app/interfaces/Inverter.ts` |
| Battery schema | `src/app/interfaces/Battery.ts` |
| Panel schema | `src/app/interfaces/PowerSource.ts` |
| Bundle schema | `src/app/interfaces/ProductBundleOffer.ts` |
| Compatibility filtering | `src/app/services/product-selector.service.ts` |
| Offer ranking / derived metrics | `src/app/services/product-deals.service.ts` |
| Sizing/checkout UI | `src/app/pages/build/`, `src/app/pages/checkout/` |

> Terminology: in this codebase an **"inverter" is the whole all-in-one power station**
> (e.g. DELTA Pro 3), not a DC→AC converter. **Solar panels are modeled as `PowerSource`** and
> live in `build.powerSources`.

## Shared pricing fields (`ProductPricing`)

Every catalog product (inverter, battery, panel) extends this:

```ts
interface ProductPricing {
  price: number;          // current verified price — used for configuration totals (required)
  listPrice?: number;     // vendor list/compare price, when verified
  productUrl?: string;    // direct official US product page
  dealVerifiedOn?: string;// ISO date 'YYYY-MM-DD'
}
```

`price` is required; the other three are optional but should all be filled when you have verified
deal data (a real product gets a URL + verification date).

## Record templates

### Inverter (power station) — `inverters.ts`

```ts
{
  // id omitted -> derives to slugify(`${brand}-${name}`). Pin an explicit id ONLY when renaming.
  name: 'DELTA Pro 3',
  brand: 'EcoFlow',
  icon: 'bi-battery-charging',          // Bootstrap Icons class
  voltages: [120, 240],                 // supported output voltages
  maxSolarInput: 2600,                  // W
  maxTotalInput: 7000,                  // W (solar + AC)
  maxOutput: 4000,                      // W continuous — drives inverter recommendations
  batteryCapacity: 4096,                // Wh built-in
  maxBatteries: 2,                      // max expansion batteries
  compatibleBatteryIds: ['ecoflow-delta-pro-smart-battery'],
  compatiblePowerSourceIds: [
    'ecoflow-400w-portable-solar-panel',
    'ecoflow-220w-bifacial-panel'
  ],
  price: 2599,
  listPrice: 3699,
  productUrl: 'https://us.ecoflow.com/products/delta-pro-3-portable-power-station',
  dealVerifiedOn: '2026-06-12'
}
```

`compatibleBatteryIds` / `compatiblePowerSourceIds` hold the **stable IDs** of the battery and
panel records they pair with. Set them to be precise; the selector only falls back to brand-match
when they're absent. There is also an older `compatibleBatteries?: Battery[]` field — prefer the
`*Ids` form for new data.

### Battery (expansion) — `batteries.ts`

```ts
{
  name: 'DELTA Pro Smart Extra Battery',
  brand: 'EcoFlow',
  icon: 'bi-battery-full',
  batteryCapacity: 3600,                // Wh
  price: 999,
  listPrice: 2799,
  productUrl: 'https://us.ecoflow.com/products/delta-pro-smart-extra-battery',
  dealVerifiedOn: '2026-06-12'
}
```

### Solar panel (`PowerSource`) — `solarPanels.ts`

```ts
{
  name: '400W Portable Solar Panel',
  brand: 'EcoFlow',
  icon: 'bi-bounding-box',
  maxOutput: 400,                       // W rated output
  price: 469,
  listPrice: 1199,
  productUrl: 'https://us.ecoflow.com/products/400w-portable-solar-panel',
  dealVerifiedOn: '2026-06-12'
}
```

Each catalog file ends with the ID-assignment call — leave it in place:

```ts
assignStableIds(batteries, battery => `${battery.brand}-${battery.name}`);
```

## Bundle offers — `product-bundle-offers.ts`

```ts
interface ProductBundleOffer {
  id: string;                   // stable offer id (e.g. 'ecoflow-delta-pro-400w')
  inverterId: string;           // stable id of the power station this offer is for
  name: string;                 // user-facing offer name
  description: string;
  highlights: string[];
  price: number;                // optimized price actually charged
  presetPrice?: number;         // vendor's preset package price, if higher than `price`
  optimizationNote?: string;    // one sentence explaining price vs presetPrice
  compareAtPrice: number;       // vendor list/compare total (savings reference)
  batteryQuantities: Record<string, number>;     // batteryId -> qty
  powerSourceQuantities: Record<string, number>; // panelId -> qty
  vendor: string;
  vendorUrl: string;
  verifiedOn: string;           // 'YYYY-MM-DD'
  availability: 'available' | 'check-vendor' | 'sold-out';
}
```

- `inverterId` and the keys of `batteryQuantities` / `powerSourceQuantities` are **stable catalog
  IDs**. The file defines local `const`s for these IDs at the top — reuse / add them rather than
  inlining string literals.
- **Don't duplicate** battery capacity or panel wattage in offer data. `ProductDealsService` derives
  `batteryCapacity` and `solarWattage` (the `ProductBundleOfferView`) from the current catalogs.
- Default `availability` to `'check-vendor'` unless you've confirmed live stock.

## Compatibility behavior (`product-selector.service.ts`)

- Inverters: recommended when `maxOutput >= peakWattage`, sorted by `maxOutput` desc. If none meet
  peak load, the whole catalog is shown (ordered by output) with an oversized-load warning — never
  an empty list.
- Batteries: filtered by `inverter.compatibleBatteryIds` when present; otherwise brand-match against
  the inverter's brand; otherwise the full catalog.
- Panels: same strategy via `compatiblePowerSourceIds`, then brand, then full catalog.

Prefer exact IDs so the brand fallback is never needed for your new product.

## Persistence & quantities

- Saved builds live in `localStorage` keyed `build_<id>` and store **deserialized copies** of
  catalog objects. They are matched back to the live catalog **by `id`** — so an ID change orphans
  the saved selection.
- Battery and panel quantities are persisted as **duplicate entries** (2× a panel = two array
  entries in `build.powerSources`). Capacity/wattage sums read straight off the arrays; the UI
  rebuilds its per-id quantity map by grouping duplicates on reload. Don't add a `quantity` field.
- An applied offer covers its required quantities; selections above the offer minimum are priced as
  extras at current catalog prices. Applying an offer merges its minimums with the existing
  configuration — it must not delete extras the sizing requires.

## Route ownership

- `/builder` — appliances, seasons, location (ZIP).
- `/build` — size and select station, batteries, panels. **No vendor shopping UI here.**
- `/checkout` — compare and apply vendor bundle offers.
- `/builds` — saved builds list (currently a placeholder).
