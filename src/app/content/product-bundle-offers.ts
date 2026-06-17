import { ProductBundleOffer } from 'src/app/interfaces/ProductBundleOffer';

const ECOFLOW_DELTA_PRO_ID = 'ecoflow-delta-pro';
const ECOFLOW_DELTA_PRO_BATTERY_ID = 'ecoflow-delta-pro-smart-battery';
const ECOFLOW_220W_PANEL_ID = 'ecoflow-220w-bifacial-panel';
const ECOFLOW_400W_PANEL_ID = 'ecoflow-400w-portable-solar-panel';
const ECOFLOW_DELTA_PRO_URL =
  'https://us.ecoflow.com/products/delta-pro-portable-power-station';
const ECOFLOW_DELTA_PRO_ULTRA_ID = 'ecoflow-delta-pro-ultra';
const ECOFLOW_DELTA_PRO_ULTRA_URL = 'https://us.ecoflow.com/products/delta-pro-ultra-solar-generator';

export const productBundleOffers: ProductBundleOffer[] = [
  {
    id: 'ecoflow-delta-pro-2x220w',
    inverterId: ECOFLOW_DELTA_PRO_ID,
    name: 'Solar starter',
    description: 'The lowest-priced DELTA Pro package with enough panel capacity for many builds.',
    highlights: ['DELTA Pro', '2 × 220W bifacial solar panels'],
    price: 2149,
    compareAtPrice: 5199,
    batteryQuantities: {},
    powerSourceQuantities: {
      [ECOFLOW_220W_PANEL_ID]: 2
    },
    vendor: 'EcoFlow',
    vendorUrl: ECOFLOW_DELTA_PRO_URL,
    verifiedOn: '2026-06-12',
    availability: 'check-vendor'
  },
  {
    id: 'ecoflow-delta-pro-400w',
    inverterId: ECOFLOW_DELTA_PRO_ID,
    name: '400W solar kit',
    description: 'A compact one-panel package for builds with a solar target up to 400W.',
    highlights: ['DELTA Pro', '1 × 400W portable solar panel'],
    price: 2168,
    presetPrice: 2229,
    optimizationNote: 'Using EcoFlow’s add-on price is $61 less than its preset package.',
    compareAtPrice: 4898,
    batteryQuantities: {},
    powerSourceQuantities: {
      [ECOFLOW_400W_PANEL_ID]: 1
    },
    vendor: 'EcoFlow',
    vendorUrl: ECOFLOW_DELTA_PRO_URL,
    verifiedOn: '2026-06-12',
    availability: 'check-vendor'
  },
  {
    id: 'ecoflow-delta-pro-extra-battery',
    inverterId: ECOFLOW_DELTA_PRO_ID,
    name: 'Extended runtime',
    description: 'Doubles storage to 7.2kWh for builds that need more than the built-in battery.',
    highlights: ['DELTA Pro', '1 × 3.6kWh smart extra battery'],
    price: 2698,
    presetPrice: 2889,
    optimizationNote: 'Using EcoFlow’s add-on price is $191 less than its preset package.',
    compareAtPrice: 6498,
    batteryQuantities: {
      [ECOFLOW_DELTA_PRO_BATTERY_ID]: 1
    },
    powerSourceQuantities: {},
    vendor: 'EcoFlow',
    vendorUrl: ECOFLOW_DELTA_PRO_URL,
    verifiedOn: '2026-06-12',
    availability: 'check-vendor'
  },
  {
    id: 'ecoflow-delta-pro-complete',
    inverterId: ECOFLOW_DELTA_PRO_ID,
    name: 'Complete solar backup',
    description: 'Adds both a full extra battery and 440W of portable solar generation.',
    highlights: ['DELTA Pro', '1 × 3.6kWh smart extra battery', '2 × 220W solar panels'],
    price: 3196,
    presetPrice: 3498,
    optimizationNote: 'Using EcoFlow’s add-on prices is $302 less than its preset package.',
    compareAtPrice: 7796,
    batteryQuantities: {
      [ECOFLOW_DELTA_PRO_BATTERY_ID]: 1
    },
    powerSourceQuantities: {
      [ECOFLOW_220W_PANEL_ID]: 2
    },
    vendor: 'EcoFlow',
    vendorUrl: ECOFLOW_DELTA_PRO_URL,
    verifiedOn: '2026-06-12',
    availability: 'check-vendor'
  },
  {
    id: 'ecoflow-delta-pro-ultra-400w',
    inverterId: ECOFLOW_DELTA_PRO_ULTRA_ID,
    name: 'DELTA Pro Ultra Solar Generator',
    description:
      'Whole-home 7.2kW station with a built-in 6kWh battery, paired with a 400W solar panel.',
    highlights: ['DELTA Pro Ultra (1 × 6kWh battery)', '1 × 400W portable solar panel'],
    price: 4499,
    optimizationNote:
      'EcoFlow’s preset Solar Generator price beats buying the station and panel à la carte.',
    compareAtPrice: 7297,
    batteryQuantities: {},
    powerSourceQuantities: {
      [ECOFLOW_400W_PANEL_ID]: 1
    },
    vendor: 'EcoFlow',
    vendorUrl: ECOFLOW_DELTA_PRO_ULTRA_URL,
    verifiedOn: '2026-06-11',
    availability: 'check-vendor'
  }
];
