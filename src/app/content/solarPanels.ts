import { PowerSource } from 'src/app/interfaces/PowerSource';
import { assignStableIds } from './catalog-utils';

let solarPanels: PowerSource[] = [
  {
    name: '400W Portable Solar Panel',
    brand: 'EcoFlow',
    icon: 'bi-bounding-box',
    maxOutput: 400,
    price: 469,
    listPrice: 1199,
    productUrl: 'https://us.ecoflow.com/products/400w-portable-solar-panel',
    dealVerifiedOn: '2026-06-12'
  },
  {
    id: 'ecoflow-220w-bifacial-panel',
    name: '220W Bifacial Solar Panel',
    brand: 'EcoFlow',
    icon: 'bi-bounding-box',
    maxOutput: 220,
    price: 249,
    listPrice: 649,
    productUrl: 'https://us.ecoflow.com/products/nextgen-220w-bifacial-portable-solar-panel',
    dealVerifiedOn: '2026-06-12'
  },
  {
    name: '100W Portable Panel',
    brand: 'EcoFlow',
    icon: 'bi-bounding-box',
    maxOutput: 100,
    price: 199
  },
  {
    name: 'PV200 Solar Panel',
    brand: 'Bluetti',
    icon: 'bi-bounding-box',
    maxOutput: 200,
    price: 499
  },
  {
    name: 'PV120 Solar Panel',
    brand: 'Bluetti',
    icon: 'bi-bounding-box',
    maxOutput: 120,
    price: 289
  },
  {
    name: 'SolarSaga 200W',
    brand: 'Jackery',
    icon: 'bi-bounding-box',
    maxOutput: 200,
    price: 499
  },
  {
    name: 'SolarSaga 100W',
    brand: 'Jackery',
    icon: 'bi-bounding-box',
    maxOutput: 100,
    price: 249
  },
  {
    name: 'Boulder 200 Briefcase',
    brand: 'Goal Zero',
    icon: 'bi-bounding-box',
    maxOutput: 200,
    price: 599.95,
    productUrl: 'https://goalzero.com/products/boulder-200-solar-panel-briefcase',
    dealVerifiedOn: '2026-06-20'
  }
];

assignStableIds(solarPanels, panel => `${panel.brand}-${panel.name}`);

export { solarPanels };
