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
    name: 'DELTA Max Smart Battery',
    brand: 'EcoFlow',
    icon: 'bi-battery-full',
    batteryCapacity: 2016,
    price: 1199
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
