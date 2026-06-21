import { ProductBundleOffer } from 'src/app/interfaces/ProductBundleOffer';

const ECOFLOW_DELTA_PRO_ID = 'ecoflow-delta-pro';
const ECOFLOW_DELTA_PRO_BATTERY_ID = 'ecoflow-delta-pro-smart-battery';
const ECOFLOW_220W_PANEL_ID = 'ecoflow-220w-bifacial-panel';
const ECOFLOW_400W_PANEL_ID = 'ecoflow-400w-portable-solar-panel';
const ECOFLOW_DELTA_PRO_URL = 'https://us.ecoflow.com/products/delta-pro-portable-power-station';
const ECOFLOW_DELTA_PRO_ULTRA_ID = 'ecoflow-delta-pro-ultra';
const ECOFLOW_DELTA_PRO_ULTRA_URL =
  'https://us.ecoflow.com/products/delta-pro-ultra-solar-generator';

const ECOFLOW_DELTA_2_ID = 'ecoflow-delta-2';
const ECOFLOW_DELTA_2_BATTERY_ID = 'ecoflow-delta-2-smart-extra-battery';
const ECOFLOW_DELTA_2_URL = 'https://us.ecoflow.com/products/delta-2-portable-power-station';
const ECOFLOW_DELTA_2_MAX_ID = 'ecoflow-delta-2-max';
const ECOFLOW_DELTA_2_MAX_URL =
  'https://us.ecoflow.com/products/delta-2-max-portable-power-station';

const ANKER_F3800_ID = 'anker-solix-f3800';
const ANKER_BP3800_BATTERY_ID = 'anker-solix-bp3800-expansion-battery';
const ANKER_PS400_PANEL_ID = 'anker-solix-ps400-panel';
const ANKER_F3800_PANEL_URL =
  'https://www.ankersolix.com/products/f3800-400w-portable-solar-panel-1';
const ANKER_F3800_BATTERY_URL = 'https://www.ankersolix.com/products/f3800-expansion-battery';

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
    verifiedOn: '2026-06-12'
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
    verifiedOn: '2026-06-12'
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
    verifiedOn: '2026-06-12'
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
    verifiedOn: '2026-06-12'
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
    verifiedOn: '2026-06-11'
  },
  {
    id: 'ecoflow-delta-2-2x220w',
    inverterId: ECOFLOW_DELTA_2_ID,
    name: 'Solar starter',
    description: 'The budget DELTA 2 paired with 440W of bifacial solar for small off-grid loads.',
    highlights: ['DELTA 2 (1kWh)', '2 × 220W bifacial solar panels'],
    price: 1182,
    compareAtPrice: 2946,
    batteryQuantities: {},
    powerSourceQuantities: {
      [ECOFLOW_220W_PANEL_ID]: 2
    },
    vendor: 'EcoFlow',
    vendorUrl: ECOFLOW_DELTA_2_URL,
    verifiedOn: '2026-06-20'
  },
  {
    id: 'ecoflow-delta-2-extra-battery',
    inverterId: ECOFLOW_DELTA_2_ID,
    name: 'Extended runtime',
    description: 'Doubles DELTA 2 storage to ~2kWh for overnight loads.',
    highlights: ['DELTA 2 (1kWh)', '1 × 1kWh smart extra battery'],
    price: 799,
    optimizationNote:
      'EcoFlow’s preset station + battery bundle ($799) beats buying the two separately.',
    compareAtPrice: 1798,
    batteryQuantities: {
      [ECOFLOW_DELTA_2_BATTERY_ID]: 1
    },
    powerSourceQuantities: {},
    vendor: 'EcoFlow',
    vendorUrl: ECOFLOW_DELTA_2_URL,
    verifiedOn: '2026-06-20'
  },
  {
    id: 'ecoflow-delta-2-max-2x220w',
    inverterId: ECOFLOW_DELTA_2_MAX_ID,
    name: 'Solar starter',
    description: 'DELTA 2 Max with 440W of bifacial solar — 2kWh and 2400W of continuous output.',
    highlights: ['DELTA 2 Max (2kWh)', '2 × 220W bifacial solar panels'],
    price: 1299,
    optimizationNote:
      'EcoFlow’s preset DELTA 2 Max + 2×220W bundle ($1,299) beats buying the parts separately.',
    compareAtPrice: 3197,
    batteryQuantities: {},
    powerSourceQuantities: {
      [ECOFLOW_220W_PANEL_ID]: 2
    },
    vendor: 'EcoFlow',
    vendorUrl: ECOFLOW_DELTA_2_MAX_URL,
    verifiedOn: '2026-06-20'
  },
  {
    id: 'anker-solix-f3800-400w',
    inverterId: ANKER_F3800_ID,
    name: 'Solar starter',
    description:
      'The 6000W F3800 split-phase station paired with a 400W panel — the cheapest way into Anker solar.',
    highlights: ['Anker SOLIX F3800 (3.84kWh)', '1 × 400W portable solar panel'],
    price: 1999,
    optimizationNote:
      'Anker’s preset F3800 + 400W bundle ($1,999) beats buying the station and panel à la carte.',
    compareAtPrice: 2399,
    batteryQuantities: {},
    powerSourceQuantities: {
      [ANKER_PS400_PANEL_ID]: 1
    },
    vendor: 'Anker',
    vendorUrl: ANKER_F3800_PANEL_URL,
    verifiedOn: '2026-06-21'
  },
  {
    id: 'anker-solix-f3800-extra-battery',
    inverterId: ANKER_F3800_ID,
    name: 'Extended runtime',
    description: 'Doubles storage to 7.68kWh for whole-day loads that outlast the built-in battery.',
    highlights: ['Anker SOLIX F3800 (3.84kWh)', '1 × 3.84kWh BP3800 expansion battery'],
    price: 3298,
    optimizationNote:
      'Anker’s preset F3800 + expansion battery bundle ($3,298) beats buying the two separately.',
    compareAtPrice: 3498,
    batteryQuantities: {
      [ANKER_BP3800_BATTERY_ID]: 1
    },
    powerSourceQuantities: {},
    vendor: 'Anker',
    vendorUrl: ANKER_F3800_BATTERY_URL,
    verifiedOn: '2026-06-21'
  },
  {
    id: 'anker-solix-f3800-complete',
    inverterId: ANKER_F3800_ID,
    name: 'Complete solar backup',
    description:
      'Adds both a full 3.84kWh expansion battery and a 400W panel for off-grid days of autonomy.',
    highlights: [
      'Anker SOLIX F3800 (3.84kWh)',
      '1 × 3.84kWh BP3800 expansion battery',
      '1 × 400W portable solar panel'
    ],
    price: 3897,
    optimizationNote:
      'Pairing Anker’s F3800 + expansion battery bundle ($3,298) with an add-on 400W panel ($599) is $100 less than buying all three à la carte.',
    compareAtPrice: 4197,
    batteryQuantities: {
      [ANKER_BP3800_BATTERY_ID]: 1
    },
    powerSourceQuantities: {
      [ANKER_PS400_PANEL_ID]: 1
    },
    vendor: 'Anker',
    vendorUrl: ANKER_F3800_BATTERY_URL,
    verifiedOn: '2026-06-21'
  }
];
