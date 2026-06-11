import { Battery } from 'src/app/interfaces/Battery';
import { assignStableIds } from './catalog-utils';

let batteries: Battery[] = [
  {
    name: 'DELTA Pro Smart Battery',
    brand: 'EcoFlow',
    icon: 'bi-battery-full',
    batteryCapacity: 3600,
    price: 1599
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
