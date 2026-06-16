# OGPP Product Catalog Model

## Key Files

| Concern | File |
| --- | --- |
| Power stations | `src/app/content/inverters.ts` |
| Expansion batteries | `src/app/content/batteries.ts` |
| Solar panels | `src/app/content/solarPanels.ts` |
| Vendor packages | `src/app/content/product-bundle-offers.ts` |
| Stable IDs | `src/app/content/catalog-utils.ts` |
| Product pricing | `src/app/interfaces/ProductPricing.ts` |
| Power station schema | `src/app/interfaces/Inverter.ts` |
| Battery schema | `src/app/interfaces/Battery.ts` |
| Panel schema | `src/app/interfaces/PowerSource.ts` |
| Bundle schema | `src/app/interfaces/ProductBundleOffer.ts` |
| Compatibility filtering | `src/app/services/product-selector.service.ts` |
| Offer ranking | `src/app/services/product-deals.service.ts` |
| Vendor-offer UI | `src/app/pages/checkout/` |

## Product Fields

All catalog products include:

- `name`, `brand`, optional stable `id`, and Bootstrap icon.
- `price`: current verified price used for configuration totals.
- `listPrice`: vendor comparison price when verified.
- `productUrl`: direct official US product page.
- `dealVerifiedOn`: ISO date, `YYYY-MM-DD`.

Power stations additionally define:

- `voltages`
- `maxSolarInput`
- `maxTotalInput`
- `maxOutput`
- built-in `batteryCapacity`
- `maxBatteries`
- `compatibleBatteryIds`
- `compatiblePowerSourceIds`

Batteries define `batteryCapacity`. Solar panels define `maxOutput`.

## Stable IDs

`assignStableIds` derives slugs from brand and name but preserves explicit IDs. Saved builds store
deserialized catalog objects in `localStorage`, so changing IDs silently corrupts old selections.

When correcting a display name, preserve the old slug:

```ts
{
  id: 'existing-stable-id',
  name: 'Corrected Vendor Name',
  // ...
}
```

Use IDs, not names or object references, in compatibility and offer records.

## Bundle Offers

Each offer contains:

- Stable offer `id` and `inverterId`.
- User-facing `name`, `description`, and `highlights`.
- Optimized `price` and vendor `compareAtPrice`.
- Optional `presetPrice` and `optimizationNote` when component pricing beats a preset.
- `batteryQuantities` and `powerSourceQuantities`, keyed by catalog IDs.
- `vendor`, official `vendorUrl`, `verifiedOn`, and `availability`.

Offer metrics are derived from current catalogs in `ProductDealsService`. Do not duplicate battery
capacity or panel wattage in offer data.

## Compatibility Behavior

Prefer exact compatibility IDs. `ProductSelectorService` may use brand fallback only when no exact
mapping exists. If no inverter meets peak load, show the entire catalog ordered by output and
surface the oversized-load warning instead of returning an empty list.

## Route Ownership

- `/builder`: appliances, season, and location.
- `/build`: size and select station, batteries, and panels.
- `/checkout`: compare and apply vendor offers.
- `/builds`: saved builds.

Do not render vendor bundle results on `/build`.

## Quantity and Pricing Rules

Selected batteries and panels are persisted as duplicate catalog entries. Quantity maps are a UI
projection rebuilt by grouping IDs.

An applied offer covers its required quantities. Any selected quantities above those requirements
are charged using current catalog prices and comparison prices. Applying an offer must merge its
minimum quantities with the existing configuration instead of deleting extras required by sizing.

## Research Checklist

For each official vendor page capture:

1. Exact product and variant name.
2. Continuous output and supported voltage.
3. Built-in capacity.
4. Maximum solar and total input.
5. Expansion battery models and maximum count.
6. Compatible panel constraints when published.
7. Current price and comparison/list price.
8. Bundle contents and package price.
9. Discounted add-on prices.
10. Stock state and offer expiration language.
11. Direct URL and exact verification date.

If official pages conflict, use conservative copy, set availability to `check-vendor`, and report
the conflict instead of inventing certainty.
