//kitchen

import { Appliance } from '../interfaces/Appliance';

// Kitchen=============================================
let kitchenAppliances: Appliance[] = [
  {
    name: 'Toaster',
    wattage: 1200,
    hours: 0.2,
    quantity: 1,
    applianceGroup: 'kitchen',
    icon: 'bi-image'
  },
  {
    name: 'Microwave',
    wattage: 1000,
    hours: 0.3,
    quantity: 1,
    applianceGroup: 'kitchen',
    icon: 'bi-image'
  },
  {
    name: 'Fridge',
    description: '20 cu. ft.',
    wattage: 353,
    hours: 4,
    quantity: 1,
    applianceGroup: 'kitchen',
    icon: 'bi-calendar3-event'
  },
  {
    name: 'Freezer',
    description: '15 cu. ft.',
    wattage: 270,
    hours: 0.3,
    quantity: 1,
    applianceGroup: 'kitchen',
    icon: 'bi-calendar3-event'
  }
];

// Entertainment=============================================
let entertainmentAppliances = [
  {
    name: 'TV',
    description: 'LCD',
    wattage: 150,
    hours: 3,
    quantity: 1,
    applianceGroup: 'entertainment',
    icon: 'bi-tv'
  },
  {
    name: 'Router + Modem',
    wattage: 14,
    hours: 24,
    quantity: 1,
    applianceGroup: 'entertainment',
    icon: 'bi-wifi'
  }
];

let allAppliances: Appliance[] = kitchenAppliances.concat(entertainmentAppliances);
let count = 0;
allAppliances.forEach(appliance => {
  appliance.id = '' + count;
  count++;
});

export { allAppliances };
