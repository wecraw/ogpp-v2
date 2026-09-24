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
    price: 1899,
    listPrice: 2799,
    productUrl: 'https://us.ecoflow.com/products/delta-pro-portable-power-station',
    dealVerifiedOn: '2026-09-23',
    availability: 'in-stock',
    vendorRef: {
      variantId: '40516140138569',
      sku: 'DELTAPro-1600W-US',
      variantTitle: 'DELTA Pro Portable Power Station'
    }
  },
  {
    // EcoFlow states both the DELTA Pro 3 Extra Battery and the older DELTA Pro Smart
    // Extra Battery work with DELTA Pro 3 (up to 2 per unit, 12kWh).
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
    compatiblePowerSourceIds: [
      'ecoflow-400w-portable-solar-panel',
      'ecoflow-220w-bifacial-panel',
      'ecoflow-100w-portable-panel'
    ],
    price: 2799,
    listPrice: 3699,
    productUrl: 'https://us.ecoflow.com/products/delta-pro-3-portable-power-station',
    dealVerifiedOn: '2026-09-23',
    availability: 'in-stock',
    vendorRef: {
      variantId: '41385721004105',
      sku: 'EFDELTAPRO3-US',
      variantTitle: 'DELTA Pro 3'
    }
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
    price: 4199,
    listPrice: 5799,
    productUrl: 'https://us.ecoflow.com/products/delta-pro-ultra',
    dealVerifiedOn: '2026-09-23',
    availability: 'in-stock',
    vendorRef: {
      variantId: '40758830071881',
      sku: 'DPU-US',
      variantTitle: 'DELTA Pro Ultra (1 × Inverter + 1 × Battery)'
    }
  },
  {
    // Discontinued on EcoFlow US: as of 2026-09-23 the product page redirects to DELTA 3.
    // Kept so saved builds still resolve; price is the last verified figure.
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
    dealVerifiedOn: '2026-06-20',
    availability: 'discontinued'
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
    price: 1029,
    listPrice: 1299,
    productUrl: 'https://us.ecoflow.com/products/delta-2-max-portable-power-station',
    dealVerifiedOn: '2026-09-23',
    availability: 'in-stock',
    vendorRef: {
      variantId: '54615943512137',
      sku: 'EFDELTA2Max-US',
      variantTitle: 'DELTA 2 Max Portable Power Station'
    }
  },
  {
    // Verified in-browser on the official US page (price renders via JS, so WebFetch
    // can't read it). $2,199.99 with no compare price shown as of 2026-09-23.
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
    compatiblePowerSourceIds: [
      'anker-solix-ps400-bifacial-portable-solar-panel',
      'anker-solix-ps400-panel'
    ],
    price: 2199,
    productUrl: 'https://www.ankersolix.com/products/f3800',
    dealVerifiedOn: '2026-09-23',
    availability: 'in-stock'
  },
  {
    // Verified in-browser on the official US page. 240V only when two units are paired
    // through a Double Voltage Hub, so a single unit is 120V. maxTotalInput is the
    // 3,600W TT-30 AC input; Anker's 6,000W generator+solar figure requires an
    // expansion battery.
    name: 'SOLIX F3000',
    brand: 'Anker',
    icon: 'bi-battery-charging',
    voltages: [120],
    maxSolarInput: 2400,
    maxTotalInput: 3600,
    maxOutput: 3600,
    batteryCapacity: 3072,
    maxBatteries: 3,
    compatibleBatteryIds: ['anker-solix-bp3000-expansion-battery'],
    compatiblePowerSourceIds: ['anker-solix-ps400-bifacial-portable-solar-panel'],
    price: 1499,
    productUrl: 'https://www.ankersolix.com/products/f3000',
    dealVerifiedOn: '2026-09-23',
    availability: 'in-stock'
  },
  {
    // The Explorer 1000 v2 station alone (solar panel not included). It has no
    // expansion port, so it takes no extra batteries.
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
    productUrl: 'https://www.jackery.com/products/jackery-explorer-1000-v2',
    dealVerifiedOn: '2026-09-23',
    availability: 'in-stock',
    vendorRef: {
      variantId: '41738382245975',
      sku: '21-0001-000220',
      variantTitle: 'Black / Explorer 1000 v2 Portable Power Station'
    }
  },
  {
    // Single unit is 120V; maxTotalInput is the 1,800W (15A) AC input.
    name: 'HomePower 2000 Plus v2',
    brand: 'Jackery',
    icon: 'bi-battery-charging',
    voltages: [120],
    maxSolarInput: 800,
    maxTotalInput: 1800,
    maxOutput: 2400,
    batteryCapacity: 2048,
    maxBatteries: 5,
    compatibleBatteryIds: ['jackery-battery-pack-2000-plus-v2'],
    compatiblePowerSourceIds: ['jackery-solarsaga-200w', 'jackery-solarsaga-500-x'],
    price: 1069,
    listPrice: 1199,
    productUrl: 'https://www.jackery.com/products/jackery-homepower-2000-plus-v2',
    dealVerifiedOn: '2026-09-23',
    availability: 'in-stock',
    vendorRef: {
      variantId: '43933829038167',
      sku: '21-0001-000402',
      variantTitle: 'HomePower 2000 Plus v2'
    }
  },
  {
    // Single unit is 120V (240V needs two units on the AC expansion port);
    // maxTotalInput is the 1,800W (15A) AC input.
    name: 'HomePower 3600 Plus',
    brand: 'Jackery',
    icon: 'bi-battery-charging',
    voltages: [120],
    maxSolarInput: 1000,
    maxTotalInput: 1800,
    maxOutput: 3600,
    batteryCapacity: 3584,
    maxBatteries: 5,
    compatibleBatteryIds: ['jackery-battery-pack-3600-plus'],
    compatiblePowerSourceIds: ['jackery-solarsaga-200w', 'jackery-solarsaga-500-x'],
    price: 1709,
    listPrice: 1899,
    productUrl: 'https://www.jackery.com/products/jackery-homepower-3600-plus',
    dealVerifiedOn: '2026-09-23',
    availability: 'in-stock',
    vendorRef: {
      variantId: '41939875102807',
      sku: '21-0001-000340',
      variantTitle: 'HomePower 3600 Plus'
    }
  },
  {
    // Sold out on the official US store as of 2026-09-23 (price still listed).
    name: 'AC200MAX',
    brand: 'Bluetti',
    icon: 'bi-battery-charging',
    voltages: [120],
    maxSolarInput: 900,
    maxTotalInput: 1400,
    maxOutput: 2200,
    batteryCapacity: 2048,
    maxBatteries: 2,
    compatibleBatteryIds: ['bluetti-b230-expansion-battery', 'bluetti-b300k-expansion-battery'],
    compatiblePowerSourceIds: [
      'bluetti-pv200-solar-panel',
      'bluetti-pv120-solar-panel',
      'bluetti-350w-solar-panel'
    ],
    price: 1199,
    listPrice: 1699,
    productUrl: 'https://www.bluettipower.com/products/ac200max-power-station',
    dealVerifiedOn: '2026-09-23',
    availability: 'out-of-stock',
    vendorRef: {
      variantId: '44272419995867',
      sku: 'AC200MAX-US-GY-BL-SPFUS',
      variantTitle: 'AC200MAX | 2,200W 2,048Wh'
    }
  },
  {
    // NEMA 14-50R gives 120/240V from a single unit. maxTotalInput is the unit-alone
    // figure; with a B300K attached Bluetti rates 6,240W.
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
    compatiblePowerSourceIds: ['bluetti-200w-portable-solar-panel', 'bluetti-350w-solar-panel'],
    price: 1499,
    listPrice: 1699,
    productUrl: 'https://www.bluettipower.com/products/apex-300-home-battery-backup',
    dealVerifiedOn: '2026-09-23',
    availability: 'in-stock',
    vendorRef: {
      variantId: '47351562174683',
      sku: 'APEX300-US-GY-BL-ID-SPFUS-00',
      variantTitle: 'Apex 300'
    }
  }
];

assignStableIds(inverters, inverter => `${inverter.brand}-${inverter.name}`);

export { inverters };
