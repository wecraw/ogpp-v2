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
    description: '1000 W cooking',
    wattage: 1500,
    hours: 0.2,
    quantity: 1,
    usageType: 'intermittent',
    applianceGroup: 'Kitchen',
    icon: 'bi-box-seam'
  },
  {
    name: 'Fridge',
    description: '20 cu ft cycling',
    wattage: 353,
    hours: 4,
    quantity: 1,
    applianceGroup: 'Kitchen',
    icon: 'bi-thermometer-snow'
  },
  {
    name: 'Freezer',
    description: '15 cu ft chest',
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
    id: 'kitchen-electric-kettle',
    name: 'Kettle',
    description: '1.7 L electric',
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
    id: 'kitchen-induction-cooktop',
    name: 'Cooktop',
    description: 'Induction burner',
    wattage: 1800,
    hours: 1,
    quantity: 1,
    usageType: 'intermittent',
    applianceGroup: 'Kitchen',
    icon: 'bi-grid-3x3-gap'
  },
  {
    name: 'Slow Cooker',
    description: '6 qt, low',
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
    description: '55 in LED',
    wattage: 100,
    hours: 4,
    quantity: 1,
    applianceGroup: 'Entertainment',
    icon: 'bi-tv'
  },
  {
    id: 'entertainment-router-modem',
    name: 'Router/Modem',
    description: 'Wi-Fi internet',
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
    description: 'USB-C charger',
    wattage: 65,
    hours: 6,
    quantity: 1,
    applianceGroup: 'Office & Devices',
    icon: 'bi-laptop'
  },
  {
    id: 'office-devices-desktop-computer',
    name: 'Desktop PC',
    description: 'PC + monitor',
    wattage: 300,
    hours: 6,
    quantity: 1,
    applianceGroup: 'Office & Devices',
    icon: 'bi-pc-display'
  },
  {
    id: 'office-devices-gaming-console',
    name: 'Game Console',
    description: 'Current-gen',
    wattage: 180,
    hours: 3,
    quantity: 1,
    applianceGroup: 'Office & Devices',
    icon: 'bi-controller'
  },
  {
    id: 'office-devices-phone-tablet-charger',
    name: 'USB-C Charger',
    description: 'Phone/tablet',
    wattage: 20,
    hours: 2,
    quantity: 2,
    applianceGroup: 'Office & Devices',
    icon: 'bi-phone'
  }
];

const lightingAppliances: Appliance[] = [
  {
    id: 'lighting-led-light-bulb',
    name: 'LED Bulb',
    description: '60 W equiv.',
    wattage: 10,
    hours: 5,
    quantity: 6,
    applianceGroup: 'Lighting',
    icon: 'bi-lightbulb'
  },
  {
    id: 'lighting-led-string-lights',
    name: 'String Lights',
    description: '48 ft outdoor',
    wattage: 25,
    hours: 5,
    quantity: 1,
    applianceGroup: 'Lighting',
    icon: 'bi-lamp'
  }
];

const medicalAppliances: Appliance[] = [
  {
    id: 'health-medical-cpap-machine',
    name: 'CPAP Machine',
    description: 'With humidifier off',
    wattage: 40,
    hours: 8,
    quantity: 1,
    applianceGroup: 'Health & Medical',
    icon: 'bi-lungs'
  }
];

const climateAppliances: Appliance[] = [
  {
    name: 'Box Fan',
    description: '20 in medium',
    wattage: 75,
    hours: 8,
    quantity: 1,
    applianceGroup: 'Heating & Cooling',
    icon: 'bi-fan'
  },
  {
    id: 'heating-cooling-window-air-conditioner',
    name: 'Window AC',
    description: '10,000 BTU',
    wattage: 1000,
    hours: 6,
    quantity: 1,
    applianceGroup: 'Heating & Cooling',
    icon: 'bi-snow'
  },
  {
    name: 'Space Heater',
    description: 'Portable, high',
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
    id: 'laundry-cleaning-washing-machine',
    name: 'Washer',
    description: 'Cold-water load',
    wattage: 500,
    hours: 0.75,
    quantity: 1,
    usageType: 'intermittent',
    applianceGroup: 'Laundry & Cleaning',
    icon: 'bi-basket'
  },
  {
    id: 'laundry-cleaning-electric-dryer',
    name: 'Dryer',
    description: 'Full-size 240 V',
    wattage: 5000,
    hours: 0.75,
    quantity: 1,
    usageType: 'intermittent',
    applianceGroup: 'Laundry & Cleaning',
    icon: 'bi-wind'
  },
  {
    id: 'laundry-cleaning-vacuum-cleaner',
    name: 'Vacuum',
    description: 'Upright',
    wattage: 1000,
    hours: 0.5,
    quantity: 1,
    usageType: 'intermittent',
    applianceGroup: 'Laundry & Cleaning',
    icon: 'bi-stars'
  },
  {
    id: 'laundry-cleaning-clothes-iron',
    name: 'Iron',
    description: 'Clothes',
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
    description: '1/2 HP running',
    wattage: 1000,
    hours: 2,
    quantity: 1,
    usageType: 'intermittent',
    applianceGroup: 'Tools & Utility',
    icon: 'bi-droplet'
  },
  {
    name: 'Sump Pump',
    description: '1/3 HP running',
    wattage: 800,
    hours: 0.5,
    quantity: 1,
    usageType: 'intermittent',
    applianceGroup: 'Tools & Utility',
    icon: 'bi-water'
  },
  {
    id: 'tools-utility-shop-vacuum',
    name: 'Shop Vac',
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
    id: 'tools-utility-tool-battery-charger',
    name: 'Tool Charger',
    description: 'Dual-port',
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
  ...medicalAppliances,
  ...climateAppliances,
  ...laundryAppliances,
  ...utilityAppliances
];

assignStableIds(allAppliances, appliance => `${appliance.applianceGroup}-${appliance.name}`);

export { allAppliances };
