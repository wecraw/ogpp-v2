import { PowerSource } from 'src/app/interfaces/PowerSource';
import { assignStableIds } from './catalog-utils';

let solarPanels: PowerSource[] = [
  {
    name: '220W Bifacial Panel',
    brand: 'EcoFlow',
    icon: 'bi-bounding-box',
    maxOutput: 220,
    price: 549
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
  }
];

assignStableIds(solarPanels, panel => `${panel.brand}-${panel.name}`);

export { solarPanels };
