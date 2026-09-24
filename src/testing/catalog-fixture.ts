import { Provider } from '@angular/core';
import { CATALOG, Catalog } from 'src/app/content/catalog';
import { resolveBundleOffers } from 'src/app/content/offer-pricing';
import { Battery } from 'src/app/interfaces/Battery';
import { Inverter } from 'src/app/interfaces/Inverter';
import { PowerSource } from 'src/app/interfaces/PowerSource';
import { ProductBundleOfferSource } from 'src/app/interfaces/ProductBundleOffer';

// A frozen snapshot of a few real catalog items (prices as of 2026-09-23) for specs.
// It deliberately does NOT track the live catalog: refreshing vendor prices must never
// break a unit test. Only edit this when a spec needs a new shape of data (e.g. a new
// availability state), and update the specs that pin these numbers alongside it.
//
// Shapes covered: an EcoFlow ladder for step-up (DELTA Pro → DELTA Pro 3 → Ultra), a
// discontinued station, an out-of-stock station and battery, a station with no
// expansion port, a discontinued panel, and bundles where the preset package wins,
// where the parts win, and where a part is out of stock.

const ecoflowPanels = [
  'ecoflow-400w-portable-solar-panel',
  'ecoflow-220w-bifacial-panel',
  'ecoflow-100w-portable-panel'
];

const inverters: Inverter[] = [
  {
    id: 'ecoflow-delta-pro',
    name: 'DELTA Pro',
    brand: 'EcoFlow',
    icon: 'bi-battery-charging',
    voltages: [120],
    maxSolarInput: 1600,
    maxTotalInput: 6500,
    maxOutput: 3600,
    batteryCapacity: 3600,
    maxBatteries: 2,
    compatibleBatteryIds: ['ecoflow-delta-pro-smart-battery'],
    compatiblePowerSourceIds: ecoflowPanels,
    price: 1899,
    listPrice: 2799,
    productUrl: 'https://us.ecoflow.com/products/delta-pro-portable-power-station',
    dealVerifiedOn: '2026-09-23',
    availability: 'in-stock'
  },
  {
    id: 'ecoflow-delta-pro-3',
    name: 'DELTA Pro 3',
    brand: 'EcoFlow',
    icon: 'bi-battery-charging',
    voltages: [120, 240],
    maxSolarInput: 2600,
    maxTotalInput: 7000,
    maxOutput: 4000,
    batteryCapacity: 4096,
    maxBatteries: 2,
    compatibleBatteryIds: ['ecoflow-delta-pro-3-extra-battery', 'ecoflow-delta-pro-smart-battery'],
    compatiblePowerSourceIds: ecoflowPanels,
    price: 2799,
    listPrice: 3699,
    availability: 'in-stock'
  },
  {
    id: 'ecoflow-delta-pro-ultra',
    name: 'DELTA Pro Ultra',
    brand: 'EcoFlow',
    icon: 'bi-battery-charging',
    voltages: [120, 240],
    maxSolarInput: 5600,
    maxTotalInput: 8800,
    maxOutput: 7200,
    batteryCapacity: 6144,
    maxBatteries: 4,
    compatibleBatteryIds: ['ecoflow-delta-pro-ultra-extra-battery'],
    compatiblePowerSourceIds: ecoflowPanels,
    price: 4199,
    listPrice: 5799,
    availability: 'in-stock'
  },
  {
    id: 'ecoflow-delta-2',
    name: 'DELTA 2',
    brand: 'EcoFlow',
    icon: 'bi-battery-charging',
    voltages: [120],
    maxSolarInput: 500,
    maxTotalInput: 1300,
    maxOutput: 1800,
    batteryCapacity: 1024,
    maxBatteries: 1,
    compatiblePowerSourceIds: ecoflowPanels,
    price: 684,
    listPrice: 1648,
    availability: 'discontinued'
  },
  {
    id: 'jackery-solar-generator-1000-v2',
    name: 'Solar Generator 1000 v2',
    brand: 'Jackery',
    icon: 'bi-battery-charging',
    voltages: [120],
    maxSolarInput: 400,
    maxTotalInput: 1800,
    maxOutput: 1500,
    batteryCapacity: 1070,
    maxBatteries: 0,
    compatiblePowerSourceIds: ['jackery-solarsaga-200w'],
    price: 499,
    listPrice: 559,
    availability: 'in-stock'
  },
  {
    id: 'bluetti-ac200max',
    name: 'AC200MAX',
    brand: 'Bluetti',
    icon: 'bi-battery-charging',
    voltages: [120],
    maxSolarInput: 900,
    maxTotalInput: 1400,
    maxOutput: 2200,
    batteryCapacity: 2048,
    maxBatteries: 2,
    compatibleBatteryIds: ['bluetti-b300k-expansion-battery'],
    compatiblePowerSourceIds: ['bluetti-200w-portable-solar-panel'],
    price: 1199,
    listPrice: 1699,
    availability: 'out-of-stock'
  },
  {
    id: 'bluetti-apex-300',
    name: 'Apex 300',
    brand: 'Bluetti',
    icon: 'bi-battery-charging',
    voltages: [120, 240],
    maxSolarInput: 2400,
    maxTotalInput: 3840,
    maxOutput: 3840,
    batteryCapacity: 2764.8,
    maxBatteries: 6,
    compatibleBatteryIds: ['bluetti-b300k-expansion-battery'],
    compatiblePowerSourceIds: ['bluetti-200w-portable-solar-panel'],
    price: 1499,
    listPrice: 1699,
    availability: 'in-stock'
  }
];

const batteries: Battery[] = [
  {
    id: 'ecoflow-delta-pro-smart-battery',
    name: 'DELTA Pro Smart Extra Battery',
    brand: 'EcoFlow',
    icon: 'bi-battery-full',
    batteryCapacity: 3600,
    price: 1199,
    listPrice: 1999,
    availability: 'out-of-stock'
  },
  {
    id: 'ecoflow-delta-pro-3-extra-battery',
    name: 'DELTA Pro 3 Extra Battery',
    brand: 'EcoFlow',
    icon: 'bi-battery-full',
    batteryCapacity: 4096,
    price: 1899,
    availability: 'in-stock'
  },
  {
    id: 'ecoflow-delta-pro-ultra-extra-battery',
    name: 'DELTA Pro Ultra Extra Battery',
    brand: 'EcoFlow',
    icon: 'bi-battery-full',
    batteryCapacity: 6144,
    price: 1800
  },
  {
    id: 'bluetti-b300k-expansion-battery',
    name: 'B300K Expansion Battery',
    brand: 'Bluetti',
    icon: 'bi-battery-full',
    batteryCapacity: 2764.8,
    price: 1099,
    listPrice: 1699,
    availability: 'in-stock'
  },
  {
    id: 'jackery-battery-pack-2000-plus-v2',
    name: 'Battery Pack 2000 Plus v2',
    brand: 'Jackery',
    icon: 'bi-battery-full',
    batteryCapacity: 2048,
    price: 899,
    listPrice: 999,
    availability: 'in-stock'
  }
];

const solarPanels: PowerSource[] = [
  {
    id: 'ecoflow-400w-portable-solar-panel',
    name: '400W Portable Solar Panel',
    brand: 'EcoFlow',
    icon: 'bi-bounding-box',
    maxOutput: 400,
    price: 599,
    listPrice: 699,
    productUrl: 'https://us.ecoflow.com/products/400w-portable-solar-panel',
    availability: 'in-stock'
  },
  {
    id: 'ecoflow-220w-bifacial-panel',
    name: '220W Bifacial Solar Panel',
    brand: 'EcoFlow',
    icon: 'bi-bounding-box',
    maxOutput: 220,
    price: 399,
    availability: 'in-stock'
  },
  {
    id: 'ecoflow-100w-portable-panel',
    name: '100W Portable Panel',
    brand: 'EcoFlow',
    icon: 'bi-bounding-box',
    maxOutput: 100,
    price: 199,
    availability: 'discontinued'
  },
  {
    id: 'bluetti-200w-portable-solar-panel',
    name: '200W Portable Solar Panel',
    brand: 'Bluetti',
    icon: 'bi-bounding-box',
    maxOutput: 200,
    price: 399,
    availability: 'in-stock'
  },
  {
    id: 'jackery-solarsaga-200w',
    name: 'SolarSaga 200W',
    brand: 'Jackery',
    icon: 'bi-bounding-box',
    maxOutput: 200,
    price: 379,
    listPrice: 429,
    availability: 'in-stock'
  }
];

const offer = (
  overrides: Partial<ProductBundleOfferSource> &
    Pick<ProductBundleOfferSource, 'id' | 'inverterId' | 'packagePrice' | 'compareAtPrice'>
): ProductBundleOfferSource => ({
  name: overrides.id,
  description: '',
  highlights: [],
  batteryQuantities: {},
  powerSourceQuantities: {},
  vendor: 'EcoFlow',
  vendorUrl: 'https://us.ecoflow.com/products/delta-pro-portable-power-station',
  verifiedOn: '2026-09-23',
  availability: 'in-stock',
  ...overrides
});

const bundleOfferSources: ProductBundleOfferSource[] = [
  // Preset beats the parts (1899 + 2 × 399 = 2697).
  offer({
    id: 'ecoflow-delta-pro-2x220w',
    inverterId: 'ecoflow-delta-pro',
    name: 'Solar starter',
    packagePrice: 2399,
    compareAtPrice: 3289,
    powerSourceQuantities: { 'ecoflow-220w-bifacial-panel': 2 }
  }),
  offer({
    id: 'ecoflow-delta-pro-400w',
    inverterId: 'ecoflow-delta-pro',
    name: '400W solar kit',
    packagePrice: 2399,
    compareAtPrice: 3329,
    powerSourceQuantities: { 'ecoflow-400w-portable-solar-panel': 1 }
  }),
  // The battery is out of stock on its own, so only the preset is purchasable.
  offer({
    id: 'ecoflow-delta-pro-extra-battery',
    inverterId: 'ecoflow-delta-pro',
    name: 'Extended runtime',
    packagePrice: 2959,
    compareAtPrice: 4809,
    batteryQuantities: { 'ecoflow-delta-pro-smart-battery': 1 }
  }),
  offer({
    id: 'ecoflow-delta-pro-complete',
    inverterId: 'ecoflow-delta-pro',
    name: 'Complete solar backup',
    packagePrice: 3479,
    compareAtPrice: 5349,
    batteryQuantities: { 'ecoflow-delta-pro-smart-battery': 1 },
    powerSourceQuantities: { 'ecoflow-220w-bifacial-panel': 2 }
  }),
  // A bundle the vendor has stopped selling: never offered.
  offer({
    id: 'ecoflow-delta-pro-3-400w',
    inverterId: 'ecoflow-delta-pro-3',
    name: '400W solar kit',
    packagePrice: 3099,
    compareAtPrice: 3999,
    powerSourceQuantities: { 'ecoflow-400w-portable-solar-panel': 1 },
    availability: 'out-of-stock'
  }),
  // The parts (1499 + 1099 + 2 × 399 = 3396) beat Bluetti's 3499 preset.
  offer({
    id: 'bluetti-apex-300-complete',
    inverterId: 'bluetti-apex-300',
    name: 'Complete solar backup',
    packagePrice: 3499,
    compareAtPrice: 4196,
    batteryQuantities: { 'bluetti-b300k-expansion-battery': 1 },
    powerSourceQuantities: { 'bluetti-200w-portable-solar-panel': 2 },
    vendor: 'Bluetti',
    vendorUrl: 'https://www.bluettipower.com/products/apex-300-home-battery-backup'
  })
];

export const CATALOG_FIXTURE: Catalog = {
  inverters,
  batteries,
  solarPanels,
  bundleOffers: resolveBundleOffers(bundleOfferSources, { inverters, batteries, solarPanels })
};

export function provideCatalogFixture(): Provider {
  return { provide: CATALOG, useValue: CATALOG_FIXTURE };
}
