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
    // Verified in-browser on the official US PS400 page (price renders via JS).
    // $599.99 sale via auto-applied code (ends ~2026-06-22); $699.99 list.
    id: 'anker-solix-ps400-panel',
    name: 'SOLIX PS400 Portable Solar Panel',
    brand: 'Anker',
    icon: 'bi-bounding-box',
    maxOutput: 400,
    price: 599,
    listPrice: 699,
    productUrl: 'https://www.ankersolix.com/products/400w-portable-solar-panel',
    dealVerifiedOn: '2026-06-21'
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
  }
];

assignStableIds(solarPanels, panel => `${panel.brand}-${panel.name}`);

export { solarPanels };
