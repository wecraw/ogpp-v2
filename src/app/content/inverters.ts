import { Inverter } from 'src/app/interfaces/Inverter';
import { assignStableIds } from './catalog-utils';

let inverters: Inverter[] = [
  {
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
    compatiblePowerSourceIds: [
      'ecoflow-400w-portable-solar-panel',
      'ecoflow-220w-bifacial-panel',
      'ecoflow-100w-portable-panel'
    ],
    price: 1699,
    listPrice: 3699,
    productUrl: 'https://us.ecoflow.com/products/delta-pro-portable-power-station',
    dealVerifiedOn: '2026-06-12'
  },
  {
    name: 'DELTA Pro 3',
    brand: 'EcoFlow',
    icon: 'bi-battery-charging',
    voltages: [120, 240],
    maxSolarInput: 2600,
    maxTotalInput: 7000,
    maxOutput: 4000,
    batteryCapacity: 4096,
    maxBatteries: 2,
    compatibleBatteryIds: ['ecoflow-delta-pro-smart-battery'],
    compatiblePowerSourceIds: [
      'ecoflow-400w-portable-solar-panel',
      'ecoflow-220w-bifacial-panel',
      'ecoflow-100w-portable-panel'
    ],
    price: 2599,
    listPrice: 3699,
    productUrl: 'https://us.ecoflow.com/products/delta-pro-3-portable-power-station',
    dealVerifiedOn: '2026-06-12'
  },
  {
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
    compatiblePowerSourceIds: [
      'ecoflow-400w-portable-solar-panel',
      'ecoflow-220w-bifacial-panel',
      'ecoflow-100w-portable-panel'
    ],
    price: 4099,
    listPrice: 6098,
    productUrl: 'https://us.ecoflow.com/products/delta-pro-ultra',
    dealVerifiedOn: '2026-06-11'
  },
  {
    name: 'DELTA 2',
    brand: 'EcoFlow',
    icon: 'bi-battery-charging',
    voltages: [120],
    maxSolarInput: 500,
    maxTotalInput: 1300,
    maxOutput: 1800,
    batteryCapacity: 1024,
    maxBatteries: 1,
    compatibleBatteryIds: ['ecoflow-delta-2-smart-extra-battery'],
    compatiblePowerSourceIds: [
      'ecoflow-400w-portable-solar-panel',
      'ecoflow-220w-bifacial-panel',
      'ecoflow-100w-portable-panel'
    ],
    price: 684,
    listPrice: 1648,
    productUrl: 'https://us.ecoflow.com/products/delta-2-portable-power-station',
    dealVerifiedOn: '2026-06-20'
  },
  {
    name: 'DELTA 2 Max',
    brand: 'EcoFlow',
    icon: 'bi-battery-charging',
    voltages: [120],
    maxSolarInput: 1000,
    maxTotalInput: 1900,
    maxOutput: 2400,
    batteryCapacity: 2048,
    maxBatteries: 2,
    compatibleBatteryIds: ['ecoflow-delta-2-max-smart-extra-battery'],
    compatiblePowerSourceIds: [
      'ecoflow-400w-portable-solar-panel',
      'ecoflow-220w-bifacial-panel',
      'ecoflow-100w-portable-panel'
    ],
    price: 899,
    listPrice: 1899,
    productUrl: 'https://us.ecoflow.com/products/delta-2-max-portable-power-station',
    dealVerifiedOn: '2026-06-20'
  },
  {
    // Verified in-browser on the official US page (price renders via JS, so WebFetch
    // can't read it). $1,799 is a $200-off promo ending 2026-06-22; $1,999 regular.
    name: 'SOLIX F3800',
    brand: 'Anker',
    icon: 'bi-battery-charging',
    voltages: [120, 240],
    maxSolarInput: 2400,
    maxTotalInput: 2400,
    maxOutput: 6000,
    batteryCapacity: 3840,
    maxBatteries: 6,
    compatibleBatteryIds: ['anker-solix-bp3800-expansion-battery'],
    price: 1799,
    listPrice: 1999,
    productUrl: 'https://www.ankersolix.com/products/f3800',
    dealVerifiedOn: '2026-06-20'
  },
  {
    name: 'Yeti 1500X',
    brand: 'Goal Zero',
    icon: 'bi-battery-charging',
    voltages: [120],
    maxSolarInput: 600,
    maxTotalInput: 600,
    maxOutput: 2000,
    batteryCapacity: 1516,
    maxBatteries: 0,
    compatiblePowerSourceIds: ['goal-zero-boulder-200-briefcase'],
    price: 1124.89,
    listPrice: 1499.95,
    productUrl: 'https://goalzero.com/products/goal-zero-yeti-1500x-portable-power-station',
    dealVerifiedOn: '2026-06-20'
  },
  {
    name: 'Solar Generator 1000 v2',
    brand: 'Jackery',
    icon: 'bi-battery-charging',
    voltages: [120],
    maxSolarInput: 400,
    maxTotalInput: 400,
    maxOutput: 1000,
    batteryCapacity: 1070,
    maxBatteries: 2,
    price: 799
  },
  {
    name: 'AC200MAX',
    brand: 'Bluetti',
    icon: 'bi-battery-charging',
    voltages: [120],
    maxSolarInput: 900,
    maxTotalInput: 1400,
    maxOutput: 2200,
    batteryCapacity: 2048,
    maxBatteries: 2,
    compatibleBatteryIds: ['bluetti-b230-expansion-battery'],
    compatiblePowerSourceIds: ['bluetti-pv200-solar-panel', 'bluetti-pv120-solar-panel'],
    price: 1199
  }
];

assignStableIds(inverters, inverter => `${inverter.brand}-${inverter.name}`);

export { inverters };
