import { Battery } from 'src/app/interfaces/Battery';
import { assignStableIds } from './catalog-utils';

let batteries: Battery[] = [
  {
    id: 'ecoflow-delta-pro-smart-battery',
    name: 'DELTA Pro Smart Extra Battery',
    brand: 'EcoFlow',
    icon: 'bi-battery-full',
    batteryCapacity: 3600,
    price: 999,
    listPrice: 2799,
    productUrl: 'https://us.ecoflow.com/products/delta-pro-smart-extra-battery',
    dealVerifiedOn: '2026-06-12'
  },
  {
    name: 'DELTA Pro Ultra Extra Battery',
    brand: 'EcoFlow',
    icon: 'bi-battery-full',
    batteryCapacity: 6144,
    price: 1600,
    listPrice: 3299,
    productUrl: 'https://us.ecoflow.com/products/delta-pro-ultra',
    dealVerifiedOn: '2026-06-11'
  },
  {
    name: 'DELTA Max Smart Battery',
    brand: 'EcoFlow',
    icon: 'bi-battery-full',
    batteryCapacity: 2016,
    price: 1199
  },
  {
    name: 'DELTA 2 Smart Extra Battery',
    brand: 'EcoFlow',
    icon: 'bi-battery-full',
    batteryCapacity: 1024,
    price: 369,
    listPrice: 799,
    productUrl: 'https://us.ecoflow.com/products/delta-2-smart-extra-battery',
    dealVerifiedOn: '2026-06-20'
  },
  {
    name: 'DELTA 2 Max Smart Extra Battery',
    brand: 'EcoFlow',
    icon: 'bi-battery-full',
    batteryCapacity: 2048,
    price: 699,
    listPrice: 1399,
    productUrl: 'https://us.ecoflow.com/products/delta-2-max-smart-extra-battery',
    dealVerifiedOn: '2026-06-20'
  },
  {
    // Verified in-browser on the official F3800 page's add-on list (price renders via JS).
    name: 'SOLIX BP3800 Expansion Battery',
    brand: 'Anker',
    icon: 'bi-battery-full',
    batteryCapacity: 3840,
    price: 1599,
    productUrl: 'https://www.ankersolix.com/products/f3800',
    dealVerifiedOn: '2026-06-20'
  },
  {
    name: 'B230 Expansion Battery',
    brand: 'Bluetti',
    icon: 'bi-battery-full',
    batteryCapacity: 2048,
    price: 949
  },
  {
    name: 'Battery Pack 1000 Plus',
    brand: 'Jackery',
    icon: 'bi-battery-full',
    batteryCapacity: 1264,
    price: 699
  }
];

assignStableIds(batteries, battery => `${battery.brand}-${battery.name}`);

export { batteries };
