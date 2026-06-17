import { Appliance } from '../interfaces/Appliance';
import { assignStableIds } from './catalog-utils';

const kitchenAppliances: Appliance[] = [
  {
    name: 'Toaster',
    description: '2-slice',
    wattage: 1200,
    hours: 0.15,
    quantity: 1,
    usageType: 'intermittent',
    applianceGroup: 'Kitchen',
    icon: 'bi-fire'
  },
  {
    name: 'Microwave',
    description: '1,000 W cooking power',
    wattage: 1500,
    hours: 0.2,
    quantity: 1,
    usageType: 'intermittent',
    applianceGroup: 'Kitchen',
    icon: 'bi-box-seam'
  },
  {
    name: 'Fridge',
    description: '20 cu. ft., cycling',
    wattage: 353,
    hours: 4,
    quantity: 1,
    applianceGroup: 'Kitchen',
    icon: 'bi-thermometer-snow'
  },
  {
    name: 'Freezer',
    description: '15 cu. ft. chest, cycling',
    wattage: 200,
    hours: 5,
    quantity: 1,
    applianceGroup: 'Kitchen',
    icon: 'bi-snow2'
  },
  {
    name: 'Coffee Maker',
    description: '10-12 cup drip',
    wattage: 1000,
    hours: 0.25,
    quantity: 1,
    usageType: 'intermittent',
    applianceGroup: 'Kitchen',
    icon: 'bi-cup-hot'
  },
  {
    name: 'Electric Kettle',
    description: '1.7 liter',
    wattage: 1500,
    hours: 0.15,
    quantity: 1,
    usageType: 'intermittent',
    applianceGroup: 'Kitchen',
    icon: 'bi-lightning-charge'
  },
  {
    name: 'Air Fryer',
    description: '5-6 quart',
    wattage: 1500,
    hours: 0.5,
    quantity: 1,
    usageType: 'intermittent',
    applianceGroup: 'Kitchen',
    icon: 'bi-wind'
  },
  {
    name: 'Induction Cooktop',
    description: 'Single burner',
    wattage: 1800,
    hours: 1,
    quantity: 1,
    usageType: 'intermittent',
    applianceGroup: 'Kitchen',
    icon: 'bi-grid-3x3-gap'
  },
  {
    name: 'Slow Cooker',
    description: '6 quart on low',
    wattage: 250,
    hours: 6,
    quantity: 1,
    applianceGroup: 'Kitchen',
    icon: 'bi-clock-history'
  }
];

const entertainmentAppliances: Appliance[] = [
  {
    name: 'TV',
    description: '55 in. LED',
    wattage: 100,
    hours: 4,
    quantity: 1,
    applianceGroup: 'Entertainment',
    icon: 'bi-tv'
  },
  {
    name: 'Router + Modem',
    wattage: 15,
    hours: 24,
    quantity: 1,
    applianceGroup: 'Entertainment',
    icon: 'bi-wifi'
  }
];

const officeAppliances: Appliance[] = [
  {
    name: 'Laptop',
    description: 'Typical USB-C charger',
    wattage: 65,
    hours: 6,
    quantity: 1,
    applianceGroup: 'Office & Devices',
    icon: 'bi-laptop'
  },
  {
    name: 'Desktop Computer',
    description: 'Computer and monitor',
    wattage: 300,
    hours: 6,
    quantity: 1,
    applianceGroup: 'Office & Devices',
    icon: 'bi-pc-display'
  },
  {
    name: 'Gaming Console',
    description: 'Current generation',
    wattage: 180,
    hours: 3,
    quantity: 1,
    applianceGroup: 'Office & Devices',
    icon: 'bi-controller'
  },
  {
    name: 'Phone / Tablet Charger',
    description: 'USB-C fast charger',
    wattage: 20,
    hours: 2,
    quantity: 2,
    applianceGroup: 'Office & Devices',
    icon: 'bi-phone'
  }
];

const lightingAppliances: Appliance[] = [
  {
    name: 'LED Light Bulb',
    description: '60 W equivalent',
    wattage: 10,
    hours: 5,
    quantity: 6,
    applianceGroup: 'Lighting',
    icon: 'bi-lightbulb'
  },
  {
    name: 'LED String Lights',
    description: '48 ft. outdoor strand',
    wattage: 25,
    hours: 5,
    quantity: 1,
    applianceGroup: 'Lighting',
    icon: 'bi-lamp'
  }
];

const climateAppliances: Appliance[] = [
  {
    name: 'Box Fan',
    description: '20 in. on medium',
    wattage: 75,
    hours: 8,
    quantity: 1,
    applianceGroup: 'Heating & Cooling',
    icon: 'bi-fan'
  },
  {
    name: 'Window Air Conditioner',
    description: '10,000 BTU',
    wattage: 1000,
    hours: 6,
    quantity: 1,
    applianceGroup: 'Heating & Cooling',
    icon: 'bi-snow'
  },
  {
    name: 'Space Heater',
    description: 'Portable, high setting',
    wattage: 1500,
    hours: 4,
    quantity: 1,
    applianceGroup: 'Heating & Cooling',
    icon: 'bi-thermometer-high'
  },
  {
    name: 'Dehumidifier',
    description: '50 pint',
    wattage: 500,
    hours: 8,
    quantity: 1,
    applianceGroup: 'Heating & Cooling',
    icon: 'bi-moisture'
  }
];

const laundryAppliances: Appliance[] = [
  {
    name: 'Washing Machine',
    description: 'One cold-water load',
    wattage: 500,
    hours: 0.75,
    quantity: 1,
    usageType: 'intermittent',
    applianceGroup: 'Laundry & Cleaning',
    icon: 'bi-basket'
  },
  {
    name: 'Electric Dryer',
    description: 'Full-size, 240 V',
    wattage: 5000,
    hours: 0.75,
    quantity: 1,
    usageType: 'intermittent',
    applianceGroup: 'Laundry & Cleaning',
    icon: 'bi-wind'
  },
  {
    name: 'Vacuum Cleaner',
    description: 'Upright',
    wattage: 1000,
    hours: 0.5,
    quantity: 1,
    usageType: 'intermittent',
    applianceGroup: 'Laundry & Cleaning',
    icon: 'bi-stars'
  },
  {
    name: 'Clothes Iron',
    wattage: 1200,
    hours: 0.3,
    quantity: 1,
    usageType: 'intermittent',
    applianceGroup: 'Laundry & Cleaning',
    icon: 'bi-triangle'
  }
];

const utilityAppliances: Appliance[] = [
  {
    name: 'Well Pump',
    description: '1/2 HP, running draw',
    wattage: 1000,
    hours: 2,
    quantity: 1,
    usageType: 'intermittent',
    applianceGroup: 'Tools & Utility',
    icon: 'bi-droplet'
  },
  {
    name: 'Sump Pump',
    description: '1/3 HP, running draw',
    wattage: 800,
    hours: 0.5,
    quantity: 1,
    usageType: 'intermittent',
    applianceGroup: 'Tools & Utility',
    icon: 'bi-water'
  },
  {
    name: 'Shop Vacuum',
    description: '12 gallon',
    wattage: 1200,
    hours: 0.5,
    quantity: 1,
    usageType: 'intermittent',
    applianceGroup: 'Tools & Utility',
    icon: 'bi-tools'
  },
  {
    name: 'Circular Saw',
    description: '7-1/4 in.',
    wattage: 1400,
    hours: 0.5,
    quantity: 1,
    usageType: 'intermittent',
    applianceGroup: 'Tools & Utility',
    icon: 'bi-disc'
  },
  {
    name: 'Tool Battery Charger',
    description: 'Dual-port rapid charger',
    wattage: 200,
    hours: 2,
    quantity: 1,
    applianceGroup: 'Tools & Utility',
    icon: 'bi-battery-charging'
  }
];

const allAppliances: Appliance[] = [
  ...kitchenAppliances,
  ...entertainmentAppliances,
  ...officeAppliances,
  ...lightingAppliances,
  ...climateAppliances,
  ...laundryAppliances,
  ...utilityAppliances
];

assignStableIds(allAppliances, appliance => `${appliance.applianceGroup}-${appliance.name}`);

export { allAppliances };
