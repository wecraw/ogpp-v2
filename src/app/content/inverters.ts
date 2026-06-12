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
    price: 1199
  }
];

assignStableIds(inverters, inverter => `${inverter.brand}-${inverter.name}`);

export { inverters };
