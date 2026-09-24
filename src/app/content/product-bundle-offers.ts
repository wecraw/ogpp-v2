import { ProductBundleOffer } from 'src/app/interfaces/ProductBundleOffer';

const ECOFLOW_DELTA_PRO_ID = 'ecoflow-delta-pro';
const ECOFLOW_DELTA_PRO_BATTERY_ID = 'ecoflow-delta-pro-smart-battery';
const ECOFLOW_220W_PANEL_ID = 'ecoflow-220w-bifacial-panel';
const ECOFLOW_400W_PANEL_ID = 'ecoflow-400w-portable-solar-panel';
const ECOFLOW_DELTA_PRO_URL = 'https://us.ecoflow.com/products/delta-pro-portable-power-station';
const ECOFLOW_DELTA_PRO_3_ID = 'ecoflow-delta-pro-3';
const ECOFLOW_DELTA_PRO_3_BATTERY_ID = 'ecoflow-delta-pro-3-extra-battery';
const ECOFLOW_DELTA_PRO_3_URL =
  'https://us.ecoflow.com/products/delta-pro-3-portable-power-station';
const ECOFLOW_DELTA_PRO_ULTRA_ID = 'ecoflow-delta-pro-ultra';
const ECOFLOW_DELTA_PRO_ULTRA_URL =
  'https://us.ecoflow.com/products/delta-pro-ultra-solar-generator';

const ECOFLOW_DELTA_2_MAX_ID = 'ecoflow-delta-2-max';
const ECOFLOW_DELTA_2_MAX_BATTERY_ID = 'ecoflow-delta-2-max-smart-extra-battery';
const ECOFLOW_DELTA_2_MAX_URL =
  'https://us.ecoflow.com/products/delta-2-max-portable-power-station';

const ANKER_F3800_ID = 'anker-solix-f3800';
const ANKER_BP3800_BATTERY_ID = 'anker-solix-bp3800-expansion-battery';
const ANKER_F3800_URL = 'https://www.ankersolix.com/products/f3800';
const ANKER_F3000_ID = 'anker-solix-f3000';
const ANKER_BP3000_BATTERY_ID = 'anker-solix-bp3000-expansion-battery';
const ANKER_F3000_URL = 'https://www.ankersolix.com/products/f3000';
// Anker's bundles say "400W Solar Panel" without naming the model; the standalone PS400
// is sold out, so these map to the current PS400 Bifacial (same 400W rating).
const ANKER_PS400_BIFACIAL_PANEL_ID = 'anker-solix-ps400-bifacial-portable-solar-panel';

const JACKERY_1000_V2_ID = 'jackery-solar-generator-1000-v2';
const JACKERY_1000_V2_URL = 'https://www.jackery.com/products/jackery-solar-generator-1000-v2';
const JACKERY_2000_PLUS_V2_ID = 'jackery-homepower-2000-plus-v2';
const JACKERY_2000_PLUS_V2_BATTERY_ID = 'jackery-battery-pack-2000-plus-v2';
const JACKERY_2000_PLUS_V2_URL = 'https://www.jackery.com/products/jackery-homepower-2000-plus-v2';
const JACKERY_3600_PLUS_ID = 'jackery-homepower-3600-plus';
const JACKERY_3600_PLUS_BATTERY_ID = 'jackery-battery-pack-3600-plus';
const JACKERY_3600_PLUS_URL = 'https://www.jackery.com/products/jackery-homepower-3600-plus';
const JACKERY_200W_PANEL_ID = 'jackery-solarsaga-200w';

const BLUETTI_APEX_300_ID = 'bluetti-apex-300';
const BLUETTI_B300K_BATTERY_ID = 'bluetti-b300k-expansion-battery';
const BLUETTI_200W_PANEL_ID = 'bluetti-200w-portable-solar-panel';
const BLUETTI_350W_PANEL_ID = 'bluetti-350w-solar-panel';
const BLUETTI_APEX_300_URL = 'https://www.bluettipower.com/products/apex-300-home-battery-backup';

export const productBundleOffers: ProductBundleOffer[] = [
  {
    id: 'ecoflow-delta-pro-2x220w',
    inverterId: ECOFLOW_DELTA_PRO_ID,
    name: 'Solar starter',
    description: 'DELTA Pro with 440W of bifacial solar — the same price as the one-panel kit.',
    highlights: ['DELTA Pro', '2 × 220W bifacial solar panels'],
    price: 2399,
    optimizationNote:
      'EcoFlow’s preset DELTA Pro + 2×220W package ($2,399) beats buying the parts separately.',
    compareAtPrice: 3289,
    batteryQuantities: {},
    powerSourceQuantities: {
      [ECOFLOW_220W_PANEL_ID]: 2
    },
    vendor: 'EcoFlow',
    vendorUrl: ECOFLOW_DELTA_PRO_URL,
    verifiedOn: '2026-09-23'
  },
  {
    id: 'ecoflow-delta-pro-400w',
    inverterId: ECOFLOW_DELTA_PRO_ID,
    name: '400W solar kit',
    description: 'A compact one-panel package for builds with a solar target up to 400W.',
    highlights: ['DELTA Pro', '1 × 400W portable solar panel'],
    price: 2399,
    optimizationNote:
      'EcoFlow’s preset DELTA Pro + 400W package ($2,399) beats buying the parts separately.',
    compareAtPrice: 3329,
    batteryQuantities: {},
    powerSourceQuantities: {
      [ECOFLOW_400W_PANEL_ID]: 1
    },
    vendor: 'EcoFlow',
    vendorUrl: ECOFLOW_DELTA_PRO_URL,
    verifiedOn: '2026-09-23'
  },
  {
    id: 'ecoflow-delta-pro-extra-battery',
    inverterId: ECOFLOW_DELTA_PRO_ID,
    name: 'Extended runtime',
    description: 'Doubles storage to 7.2kWh for builds that need more than the built-in battery.',
    highlights: ['DELTA Pro', '1 × 3.6kWh smart extra battery'],
    price: 2959,
    optimizationNote:
      'EcoFlow’s preset DELTA Pro + extra battery package ($2,959) beats buying the two separately.',
    compareAtPrice: 4809,
    batteryQuantities: {
      [ECOFLOW_DELTA_PRO_BATTERY_ID]: 1
    },
    powerSourceQuantities: {},
    vendor: 'EcoFlow',
    vendorUrl: ECOFLOW_DELTA_PRO_URL,
    verifiedOn: '2026-09-23'
  },
  {
    id: 'ecoflow-delta-pro-complete',
    inverterId: ECOFLOW_DELTA_PRO_ID,
    name: 'Complete solar backup',
    description: 'Adds both a full extra battery and 440W of portable solar generation.',
    highlights: ['DELTA Pro', '1 × 3.6kWh smart extra battery', '2 × 220W solar panels'],
    price: 3479,
    optimizationNote:
      'EcoFlow’s preset complete package ($3,479) beats any combination of its smaller bundles and add-ons.',
    compareAtPrice: 5349,
    batteryQuantities: {
      [ECOFLOW_DELTA_PRO_BATTERY_ID]: 1
    },
    powerSourceQuantities: {
      [ECOFLOW_220W_PANEL_ID]: 2
    },
    vendor: 'EcoFlow',
    vendorUrl: ECOFLOW_DELTA_PRO_URL,
    verifiedOn: '2026-09-23'
  },
  {
    id: 'ecoflow-delta-pro-3-400w',
    inverterId: ECOFLOW_DELTA_PRO_3_ID,
    name: '400W solar kit',
    description: 'The 4kW dual-voltage DELTA Pro 3 paired with a 400W portable panel.',
    highlights: ['DELTA Pro 3 (4kWh)', '1 × 400W portable solar panel'],
    price: 3099,
    optimizationNote:
      'EcoFlow’s preset DELTA Pro 3 + 400W package ($3,099) beats buying the parts separately.',
    compareAtPrice: 3999,
    batteryQuantities: {},
    powerSourceQuantities: {
      [ECOFLOW_400W_PANEL_ID]: 1
    },
    vendor: 'EcoFlow',
    vendorUrl: ECOFLOW_DELTA_PRO_3_URL,
    verifiedOn: '2026-09-23'
  },
  {
    id: 'ecoflow-delta-pro-3-extra-battery',
    inverterId: ECOFLOW_DELTA_PRO_3_ID,
    name: 'Extended runtime',
    description: 'Doubles storage to 8kWh for builds that outlast the built-in battery.',
    highlights: ['DELTA Pro 3 (4kWh)', '1 × 4kWh DELTA Pro 3 extra battery'],
    price: 4459,
    optimizationNote:
      'EcoFlow’s preset DELTA Pro 3 + extra battery package ($4,459) beats buying the two separately.',
    compareAtPrice: 5598,
    batteryQuantities: {
      [ECOFLOW_DELTA_PRO_3_BATTERY_ID]: 1
    },
    powerSourceQuantities: {},
    vendor: 'EcoFlow',
    vendorUrl: ECOFLOW_DELTA_PRO_3_URL,
    verifiedOn: '2026-09-23'
  },
  {
    id: 'ecoflow-delta-pro-3-complete',
    inverterId: ECOFLOW_DELTA_PRO_3_ID,
    name: 'Complete solar backup',
    description: 'Adds both a 4kWh extra battery and a 400W panel for multi-day autonomy.',
    highlights: [
      'DELTA Pro 3 (4kWh)',
      '1 × 4kWh DELTA Pro 3 extra battery',
      '1 × 400W portable solar panel'
    ],
    price: 4789,
    optimizationNote:
      'EcoFlow’s preset complete package ($4,789) beats any combination of its smaller bundles and add-ons.',
    compareAtPrice: 6297,
    batteryQuantities: {
      [ECOFLOW_DELTA_PRO_3_BATTERY_ID]: 1
    },
    powerSourceQuantities: {
      [ECOFLOW_400W_PANEL_ID]: 1
    },
    vendor: 'EcoFlow',
    vendorUrl: ECOFLOW_DELTA_PRO_3_URL,
    verifiedOn: '2026-09-23'
  },
  {
    id: 'ecoflow-delta-pro-ultra-400w',
    inverterId: ECOFLOW_DELTA_PRO_ULTRA_ID,
    name: 'DELTA Pro Ultra Solar Generator',
    description:
      'Whole-home 7.2kW station with a built-in 6kWh battery, paired with a 400W solar panel.',
    highlights: ['DELTA Pro Ultra (1 × 6kWh battery)', '1 × 400W portable solar panel'],
    price: 4599,
    optimizationNote:
      'EcoFlow’s preset Solar Generator price beats buying the station and panel à la carte.',
    compareAtPrice: 6498,
    batteryQuantities: {},
    powerSourceQuantities: {
      [ECOFLOW_400W_PANEL_ID]: 1
    },
    vendor: 'EcoFlow',
    vendorUrl: ECOFLOW_DELTA_PRO_ULTRA_URL,
    verifiedOn: '2026-09-23'
  },
  {
    id: 'ecoflow-delta-2-max-2x220w',
    inverterId: ECOFLOW_DELTA_2_MAX_ID,
    name: 'Solar starter',
    description: 'DELTA 2 Max with 440W of bifacial solar — 2kWh and 2400W of continuous output.',
    highlights: ['DELTA 2 Max (2kWh)', '2 × 220W bifacial solar panels'],
    price: 1579,
    optimizationNote:
      'EcoFlow’s preset DELTA 2 Max + 2×220W bundle ($1,579) beats buying the parts separately.',
    compareAtPrice: 2097,
    batteryQuantities: {},
    powerSourceQuantities: {
      [ECOFLOW_220W_PANEL_ID]: 2
    },
    vendor: 'EcoFlow',
    vendorUrl: ECOFLOW_DELTA_2_MAX_URL,
    verifiedOn: '2026-09-23'
  },
  {
    id: 'ecoflow-delta-2-max-extra-battery',
    inverterId: ECOFLOW_DELTA_2_MAX_ID,
    name: 'Extended runtime',
    description: 'Doubles DELTA 2 Max storage to 4kWh for overnight and multi-day loads.',
    highlights: ['DELTA 2 Max (2kWh)', '1 × 2kWh smart extra battery'],
    price: 1849,
    optimizationNote:
      'EcoFlow’s preset DELTA 2 Max + extra battery bundle ($1,849) beats buying the two separately.',
    compareAtPrice: 2198,
    batteryQuantities: {
      [ECOFLOW_DELTA_2_MAX_BATTERY_ID]: 1
    },
    powerSourceQuantities: {},
    vendor: 'EcoFlow',
    vendorUrl: ECOFLOW_DELTA_2_MAX_URL,
    verifiedOn: '2026-09-23'
  },
  {
    id: 'anker-solix-f3800-2x400w',
    inverterId: ANKER_F3800_ID,
    name: 'Solar starter',
    description: 'The 6000W F3800 split-phase station paired with 800W of portable solar.',
    highlights: ['Anker SOLIX F3800 (3.84kWh)', '2 × 400W portable solar panels'],
    price: 2899,
    optimizationNote:
      'Anker’s preset F3800 + 2×400W bundle ($2,899) beats buying the station and panels à la carte.',
    compareAtPrice: 3099,
    batteryQuantities: {},
    powerSourceQuantities: {
      [ANKER_PS400_BIFACIAL_PANEL_ID]: 2
    },
    vendor: 'Anker',
    vendorUrl: ANKER_F3800_URL,
    verifiedOn: '2026-09-23'
  },
  {
    id: 'anker-solix-f3800-extra-battery',
    inverterId: ANKER_F3800_ID,
    name: 'Extended runtime',
    description:
      'Doubles storage to 7.68kWh for whole-day loads that outlast the built-in battery.',
    highlights: ['Anker SOLIX F3800 (3.84kWh)', '1 × 3.84kWh BP3800 expansion battery'],
    price: 3898,
    optimizationNote:
      'Anker’s preset F3800 + expansion battery bundle ($3,898) beats buying the two separately.',
    compareAtPrice: 3998,
    batteryQuantities: {
      [ANKER_BP3800_BATTERY_ID]: 1
    },
    powerSourceQuantities: {},
    vendor: 'Anker',
    vendorUrl: ANKER_F3800_URL,
    verifiedOn: '2026-09-23'
  },
  {
    id: 'anker-solix-f3800-complete',
    inverterId: ANKER_F3800_ID,
    name: 'Complete solar backup',
    description:
      'Adds both a full 3.84kWh expansion battery and 800W of solar for off-grid days of autonomy.',
    highlights: [
      'Anker SOLIX F3800 (3.84kWh)',
      '1 × 3.84kWh BP3800 expansion battery',
      '2 × 400W portable solar panels'
    ],
    price: 4498,
    optimizationNote:
      'Anker’s preset complete bundle ($4,498) beats pairing its smaller bundles with add-on panels.',
    compareAtPrice: 4798,
    batteryQuantities: {
      [ANKER_BP3800_BATTERY_ID]: 1
    },
    powerSourceQuantities: {
      [ANKER_PS400_BIFACIAL_PANEL_ID]: 2
    },
    vendor: 'Anker',
    vendorUrl: ANKER_F3800_URL,
    verifiedOn: '2026-09-23'
  },
  {
    id: 'anker-solix-f3000-extra-battery',
    inverterId: ANKER_F3000_ID,
    name: 'Extended runtime',
    description: 'Doubles F3000 storage to 6.1kWh for longer outages.',
    highlights: ['Anker SOLIX F3000 (3.07kWh)', '1 × 3.07kWh BP3000 expansion battery'],
    price: 2499,
    optimizationNote:
      'Anker’s preset F3000 + expansion battery bundle ($2,499) beats buying the two separately.',
    compareAtPrice: 2698,
    batteryQuantities: {
      [ANKER_BP3000_BATTERY_ID]: 1
    },
    powerSourceQuantities: {},
    vendor: 'Anker',
    vendorUrl: ANKER_F3000_URL,
    verifiedOn: '2026-09-23'
  },
  {
    id: 'anker-solix-f3000-complete',
    inverterId: ANKER_F3000_ID,
    name: 'Complete solar backup',
    description: 'F3000 with an expansion battery and 800W of portable solar.',
    highlights: [
      'Anker SOLIX F3000 (3.07kWh)',
      '1 × 3.07kWh BP3000 expansion battery',
      '2 × 400W portable solar panels'
    ],
    price: 3099,
    optimizationNote:
      'Anker’s preset complete bundle ($3,099) beats pairing the battery bundle with add-on panels.',
    compareAtPrice: 3399,
    batteryQuantities: {
      [ANKER_BP3000_BATTERY_ID]: 1
    },
    powerSourceQuantities: {
      [ANKER_PS400_BIFACIAL_PANEL_ID]: 2
    },
    vendor: 'Anker',
    vendorUrl: ANKER_F3000_URL,
    verifiedOn: '2026-09-23'
  },
  {
    id: 'jackery-solar-generator-1000-v2-200w',
    inverterId: JACKERY_1000_V2_ID,
    name: 'Solar starter',
    description: 'The compact 1kWh Explorer 1000 v2 paired with a 200W SolarSaga panel.',
    highlights: ['Jackery Explorer 1000 v2 (1.07kWh)', '1 × SolarSaga 200W panel'],
    price: 699,
    optimizationNote:
      'Jackery’s preset Solar Generator 1000 v2 ($699) beats buying the station and panel separately.',
    compareAtPrice: 879,
    batteryQuantities: {},
    powerSourceQuantities: {
      [JACKERY_200W_PANEL_ID]: 1
    },
    vendor: 'Jackery',
    vendorUrl: JACKERY_1000_V2_URL,
    verifiedOn: '2026-09-23'
  },
  {
    id: 'jackery-homepower-2000-plus-v2-2x200w',
    inverterId: JACKERY_2000_PLUS_V2_ID,
    name: 'Solar starter',
    description: 'HomePower 2000 Plus v2 with 400W of SolarSaga panels.',
    highlights: ['Jackery HomePower 2000 Plus v2 (2kWh)', '2 × SolarSaga 200W panels'],
    price: 1659,
    optimizationNote:
      'Jackery’s preset 2000 Plus v2 + 2×200W bundle ($1,659) beats buying the parts separately.',
    compareAtPrice: 1839,
    batteryQuantities: {},
    powerSourceQuantities: {
      [JACKERY_200W_PANEL_ID]: 2
    },
    vendor: 'Jackery',
    vendorUrl: JACKERY_2000_PLUS_V2_URL,
    verifiedOn: '2026-09-23'
  },
  {
    id: 'jackery-homepower-2000-plus-v2-extra-battery',
    inverterId: JACKERY_2000_PLUS_V2_ID,
    name: 'Extended runtime',
    description: 'Doubles HomePower 2000 Plus v2 storage to 4kWh.',
    highlights: ['Jackery HomePower 2000 Plus v2 (2kWh)', '1 × 2kWh Battery Pack 2000 Plus v2'],
    price: 1679,
    optimizationNote:
      'Jackery’s preset station + battery bundle ($1,679) beats buying the two separately.',
    compareAtPrice: 1889,
    batteryQuantities: {
      [JACKERY_2000_PLUS_V2_BATTERY_ID]: 1
    },
    powerSourceQuantities: {},
    vendor: 'Jackery',
    vendorUrl: JACKERY_2000_PLUS_V2_URL,
    verifiedOn: '2026-09-23'
  },
  {
    id: 'jackery-homepower-3600-plus-2x200w',
    inverterId: JACKERY_3600_PLUS_ID,
    name: 'Solar starter',
    description: 'The 3.6kW HomePower 3600 Plus with 400W of SolarSaga panels.',
    highlights: ['Jackery HomePower 3600 Plus (3.58kWh)', '2 × SolarSaga 200W panels'],
    price: 2289,
    optimizationNote:
      'Jackery’s preset 3600 Plus + 2×200W bundle ($2,289) beats buying the parts separately.',
    compareAtPrice: 2549,
    batteryQuantities: {},
    powerSourceQuantities: {
      [JACKERY_200W_PANEL_ID]: 2
    },
    vendor: 'Jackery',
    vendorUrl: JACKERY_3600_PLUS_URL,
    verifiedOn: '2026-09-23'
  },
  {
    id: 'jackery-homepower-3600-plus-extra-battery',
    inverterId: JACKERY_3600_PLUS_ID,
    name: 'Extended runtime',
    description: 'Doubles HomePower 3600 Plus storage to 7.2kWh.',
    highlights: ['Jackery HomePower 3600 Plus (3.58kWh)', '1 × 3.58kWh Battery Pack 3600 Plus'],
    price: 2879,
    optimizationNote:
      'Jackery’s preset station + battery bundle ($2,879) beats buying the two separately.',
    compareAtPrice: 3309,
    batteryQuantities: {
      [JACKERY_3600_PLUS_BATTERY_ID]: 1
    },
    powerSourceQuantities: {},
    vendor: 'Jackery',
    vendorUrl: JACKERY_3600_PLUS_URL,
    verifiedOn: '2026-09-23'
  },
  {
    id: 'bluetti-apex-300-350w',
    inverterId: BLUETTI_APEX_300_ID,
    name: 'Solar starter',
    description: 'The 3.8kW dual-voltage Apex 300 paired with a 350W panel.',
    highlights: ['Bluetti Apex 300 (2.76kWh)', '1 × 350W solar panel'],
    price: 2069,
    optimizationNote:
      'Bluetti’s preset Apex 300 + 350W bundle ($2,069) beats buying the parts separately.',
    compareAtPrice: 2348,
    batteryQuantities: {},
    powerSourceQuantities: {
      [BLUETTI_350W_PANEL_ID]: 1
    },
    vendor: 'Bluetti',
    vendorUrl: BLUETTI_APEX_300_URL,
    verifiedOn: '2026-09-23'
  },
  {
    id: 'bluetti-apex-300-extra-battery',
    inverterId: BLUETTI_APEX_300_ID,
    name: 'Extended runtime',
    description: 'Doubles Apex 300 storage to 5.5kWh with a B300K expansion battery.',
    highlights: ['Bluetti Apex 300 (2.76kWh)', '1 × 2.76kWh B300K expansion battery'],
    price: 2598,
    presetPrice: 2599,
    optimizationNote:
      'Buying the Apex 300 and B300K separately is $1 less than Bluetti’s preset bundle.',
    compareAtPrice: 2799,
    batteryQuantities: {
      [BLUETTI_B300K_BATTERY_ID]: 1
    },
    powerSourceQuantities: {},
    vendor: 'Bluetti',
    vendorUrl: BLUETTI_APEX_300_URL,
    verifiedOn: '2026-09-23'
  },
  {
    id: 'bluetti-apex-300-complete',
    inverterId: BLUETTI_APEX_300_ID,
    name: 'Complete solar backup',
    description: 'Apex 300 with a B300K expansion battery and 400W of portable solar.',
    highlights: [
      'Bluetti Apex 300 (2.76kWh)',
      '1 × 2.76kWh B300K expansion battery',
      '2 × 200W portable solar panels'
    ],
    price: 3396,
    presetPrice: 3499,
    optimizationNote:
      'Buying the Apex 300, B300K, and two 200W panels separately is $103 less than Bluetti’s preset bundle.',
    compareAtPrice: 4196,
    batteryQuantities: {
      [BLUETTI_B300K_BATTERY_ID]: 1
    },
    powerSourceQuantities: {
      [BLUETTI_200W_PANEL_ID]: 2
    },
    vendor: 'Bluetti',
    vendorUrl: BLUETTI_APEX_300_URL,
    verifiedOn: '2026-09-23'
  }
];
