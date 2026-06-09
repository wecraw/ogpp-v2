//Kitchen

import { Appliance } from '../interfaces/Appliance';
import { assignStableIds } from './catalog-utils';

// Kitchen=============================================
let KitchenAppliances: Appliance[] = [
  {
    name: 'Toaster',
    wattage: 1200,
    hours: 0.2,
    quantity: 1,
    applianceGroup: 'Kitchen',
    icon: 'bi-fire'
  },
  {
    name: 'Microwave',
    wattage: 1000,
    hours: 0.3,
    quantity: 1,
    applianceGroup: 'Kitchen',
    icon: 'bi-box-seam'
  },
  {
    name: 'Fridge',
    description: '20 cu. ft.',
    wattage: 353,
    hours: 4,
    quantity: 1,
    applianceGroup: 'Kitchen',
    icon: 'bi-thermometer-snow'
  },
  {
    name: 'Freezer',
    description: '15 cu. ft.',
    wattage: 270,
    hours: 0.3,
    quantity: 1,
    applianceGroup: 'Kitchen',
    icon: 'bi-snow2'
  }
];

// Entertainment=============================================
let EntertainmentAppliances = [
  {
    name: 'TV',
    description: 'LCD',
    wattage: 150,
    hours: 3,
    quantity: 1,
    applianceGroup: 'Entertainment',
    icon: 'bi-tv'
  },
  {
    name: 'Router + Modem',
    wattage: 14,
    hours: 24,
    quantity: 1,
    applianceGroup: 'Entertainment',
    icon: 'bi-wifi'
  }
];

let allAppliances: Appliance[] = KitchenAppliances.concat(EntertainmentAppliances);
assignStableIds(allAppliances, appliance => `${appliance.applianceGroup}-${appliance.name}`);

export { allAppliances };
