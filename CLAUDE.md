# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

OGPP ("Off Grid Part Picker") recommends an all-in-one solar power system (EcoFlow, Jackery, Bluetti, etc.) based on the appliances a user wants to run off-grid. The user selects appliances and a location, and the app sizes and recommends matching gear.

Angular 21 SPA, standalone components (no NgModules), built-in control flow (`@if`/`@for`), client-side only. State persists in `localStorage` — there is no backend of our own; the only external call is to NREL for solar irradiance data.

> **Angular version:** on 21 (current LTS). The next major (22) requires Node ≥ 22.22.3; this machine has 22.14.0, so bump Node before running `ng update @angular/core@22 @angular/cli@22`. Upgrade one major at a time, building between each.

This project is **unfinished and was picked back up from a stale state** — see "Current state / known gaps" before assuming a feature works end to end.

## Commands

- `npm start` / `ng serve` — dev server at http://localhost:4200 (auto-reload)
- `npm run build` / `ng build` — production build to `dist/ogpp-v2`
- `npm run watch` — dev build, rebuild on change
- `npm test` / `ng test` — Karma + Jasmine unit tests (Chrome). Karma is deprecated in Angular 21; a future move to the new test runner is expected.
- Run once, headless (CI-style): `ng test --watch=false --browsers=ChromeHeadless`
- Single test: `ng test --include='**/calculation-utils.service.spec.ts'`

> The component `*.spec.ts` files are unmodified CLI scaffolding and **5 of them currently fail** — the auto-generated `should create` tests don't provide required inputs/providers (e.g. `BuilderComponent` needs `HttpClient`; `BuildComponentCardComponent` needs its `[component]` input). These are stale stubs, not real coverage; fix or delete them when you touch a component.

Prettier enforces: single quotes, semicolons, no trailing commas, 100-char width, avoid-arrow-parens. TypeScript runs in `strict` mode with `strictTemplates`.

## Architecture

### The Build is the central object
`Build` (`src/app/interfaces/Build.ts`) is the single document that flows through the whole app. The user constructs one on `/builder`, it's saved to `localStorage`, then read back on `/build` for recommendations. A Build holds the user's inputs (`appliances`, `seasons`, `zipCode`, `monthlyGhi`) and their chosen gear (`powerSources`, `inverter`, `batteries`).

### Routes and the user flow
`src/app/app.routes.ts` — three pages, default redirect to `/builder`:
1. **`/builder`** (`BuilderComponent`) — the wizard. Step 1: pick appliances + seasons + ZIP. Computes live `peakWattage` and `totalWattHours`. On submit, fetches sun-hours, assigns a `uuid` to the build, saves it, and navigates to `/build?buildId=...`.
2. **`/build`** (`BuildComponent`) — reads the build by `buildId` query param and shows matching products to choose an inverter, with compatibility checks.
3. **`/builds`** (`BuildsComponent`) — intended saved-builds list; currently an empty placeholder.

Pages pass the build between each other **only via the `?buildId=` query param**, re-loading from `localStorage` on each `ngOnInit`. There is no shared in-memory build state/store.

### Services (the domain logic lives here)
- **`BuildService`** — CRUD for builds in `localStorage`, keyed `build_<id>`.
- **`CalculationUtilsService`** — the sizing math: `peakWattage` (sum of wattage×qty), `totalWattHours` (×hours too), `getSunHoursBySeason` (maps selected seasons → months → min monthly GHI), `wattageNeeded` (wattHours ÷ sun hours).
- **`SunHoursService`** — calls the NREL `solar_resource` API by ZIP to get `monthlyGhi`.
- **`ProductSelectorService`** — filters the gear catalogs against a build's requirements.

### Content catalogs (hand-curated product/appliance data)
`src/app/content/*.ts` export plain arrays: `appliances.ts`, `inverters.ts`, `batteries.ts`, `solarPanels.ts`, plus `strings.ts` for UI copy. **IDs are assigned at module-load time** by a `forEach` counter (`id = '' + count`), so an item's ID is its position in the array — reordering or removing entries renumbers everything. Components match builds back to catalog items by these positional IDs.

### Terminology gotcha
"Inverter" in this codebase means the **all-in-one power station unit** (e.g. DELTA Pro 3), not just the DC→AC converter. The `Inverter` interface carries `maxOutput`, `maxSolarInput`, `batteryCapacity`, `compatibleBatteries`, etc. The separate `PowerSource` interface is for add-on generation sources. `BuildComponent.ts` (the interface, not the page) is fully commented out — an abandoned earlier unified model; don't use it.

## Current state / known gaps

- **Debug bypass:** `BuilderComponent.debug = true` skips the real NREL call and stubs `monthlyGhi` to all-1s. Set to `false` to exercise real sun-hours lookups. Note this makes `getSunHoursBySeason` return 1, so `wattageNeeded` is unrealistic while debug is on.
- **`ProductSelectorService.getMatchingBatteries` is a stub** returning only `defaultBattery`; battery/solar-panel recommendation isn't implemented. `getMatchingInverters` only filters by `maxOutput >= peakWattage`.
- **`/builds` page is empty.** Saved builds accumulate in `localStorage` but there's no UI to list them.
- **`solarPanels.ts` is empty.**
- The NREL API key is hardcoded in `SunHoursService` — move it out before any real deployment.
