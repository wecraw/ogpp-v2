import { Battery } from 'src/app/interfaces/Battery';
import { assignStableIds } from './catalog-utils';

let batteries: Battery[] = [
  {
    // Out of stock standalone on EcoFlow US as of 2026-09-23 (still sold in the
    // DELTA Pro + Extra Battery bundle).
    id: 'ecoflow-delta-pro-smart-battery',
    name: 'DELTA Pro Smart Extra Battery',
    brand: 'EcoFlow',
    icon: 'bi-battery-full',
    batteryCapacity: 3600,
    price: 1199,
    listPrice: 1999,
    productUrl: 'https://us.ecoflow.com/products/delta-pro-smart-extra-battery',
    dealVerifiedOn: '2026-09-23',
    availability: 'out-of-stock',
    vendorRef: {
      variantId: '40558805385289',
      sku: 'DELTAProEB-US',
      variantTitle: 'DELTA Pro Smart Extra Battery'
    }
  },
  {
    name: 'DELTA Pro 3 Extra Battery',
    brand: 'EcoFlow',
    icon: 'bi-battery-full',
    batteryCapacity: 4096,
    price: 1899,
    productUrl: 'https://us.ecoflow.com/products/delta-pro-3-extra-battery',
    dealVerifiedOn: '2026-09-23',
    availability: 'in-stock',
    vendorRef: {
      variantId: '41385808199753',
      sku: 'EFDELTAPRO3EB',
      variantTitle: 'DELTA Pro 3 Extra Battery'
    }
  },
  {
    // EcoFlow US has no standalone listing; $1,800 is the difference between the
    // DELTA Pro Ultra ($4,199) and its 1 × inverter + 2 × batteries package ($5,999).
    name: 'DELTA Pro Ultra Extra Battery',
    brand: 'EcoFlow',
    icon: 'bi-battery-full',
    batteryCapacity: 6144,
    price: 1800,
    productUrl: 'https://us.ecoflow.com/products/delta-pro-ultra-delta-pro-ultra-extra-battery',
    dealVerifiedOn: '2026-09-23'
  },
  {
    name: 'DELTA Max Smart Battery',
    brand: 'EcoFlow',
    icon: 'bi-battery-full',
    batteryCapacity: 2016,
    price: 1199
  },
  {
    // Discontinued on EcoFlow US: the product page 404s as of 2026-09-23. Kept so
    // saved builds still resolve; price is the last verified figure.
    name: 'DELTA 2 Smart Extra Battery',
    brand: 'EcoFlow',
    icon: 'bi-battery-full',
    batteryCapacity: 1024,
    price: 369,
    listPrice: 799,
    dealVerifiedOn: '2026-06-20',
    availability: 'discontinued'
  },
  {
    // Out of stock standalone on EcoFlow US as of 2026-09-23 (still sold in the
    // DELTA 2 Max + Extra Battery bundle).
    name: 'DELTA 2 Max Smart Extra Battery',
    brand: 'EcoFlow',
    icon: 'bi-battery-full',
    batteryCapacity: 2048,
    price: 899,
    productUrl: 'https://us.ecoflow.com/products/delta-2-max-smart-extra-battery',
    dealVerifiedOn: '2026-09-23',
    availability: 'out-of-stock',
    vendorRef: {
      variantId: '40954813448265',
      sku: 'EFDELTA2MaxEB',
      variantTitle: 'DELTA 2 Max Smart Extra Battery'
    }
  },
  {
    // Verified in-browser on the official US page (price renders via JS).
    name: 'SOLIX BP3800 Expansion Battery',
    brand: 'Anker',
    icon: 'bi-battery-full',
    batteryCapacity: 3840,
    price: 1799,
    productUrl: 'https://www.ankersolix.com/products/bp3800-expansion-battery',
    dealVerifiedOn: '2026-09-23',
    availability: 'in-stock'
  },
  {
    // Verified in-browser on the official F3000 page's add-on list (price renders via JS).
    name: 'SOLIX BP3000 Expansion Battery',
    brand: 'Anker',
    icon: 'bi-battery-full',
    batteryCapacity: 3072,
    price: 1199,
    productUrl: 'https://www.ankersolix.com/products/bp3000-expansion-battery-for-f3000',
    dealVerifiedOn: '2026-09-23',
    availability: 'in-stock'
  },
  {
    // Sold out on the official US store as of 2026-09-23 (price still listed).
    name: 'B230 Expansion Battery',
    brand: 'Bluetti',
    icon: 'bi-battery-full',
    batteryCapacity: 2048,
    price: 999,
    listPrice: 1299,
    productUrl: 'https://www.bluettipower.com/products/b230-battery-pack',
    dealVerifiedOn: '2026-09-23',
    availability: 'out-of-stock',
    vendorRef: {
      variantId: '44466852823259',
      sku: 'B230-UN-GY-BL-SPFUS',
      variantTitle: 'Default Title'
    }
  },
  {
    name: 'B300K Expansion Battery',
    brand: 'Bluetti',
    icon: 'bi-battery-full',
    batteryCapacity: 2764.8,
    price: 1099,
    listPrice: 1699,
    productUrl: 'https://www.bluettipower.com/products/bluetti-b300k-expansion-battery',
    dealVerifiedOn: '2026-09-23',
    availability: 'in-stock',
    vendorRef: {
      variantId: '45969643110619',
      sku: 'B300K-UN-GY-BL-SPFUS-00',
      variantTitle: 'B300K Expansion Battery | 2,764.8Wh'
    }
  },
  {
    // No longer sold new on jackery.com as of 2026-09-23; unverified legacy entry.
    name: 'Battery Pack 1000 Plus',
    brand: 'Jackery',
    icon: 'bi-battery-full',
    batteryCapacity: 1264,
    price: 699,
    availability: 'discontinued'
  },
  {
    name: 'Battery Pack 2000 Plus v2',
    brand: 'Jackery',
    icon: 'bi-battery-full',
    batteryCapacity: 2048,
    price: 899,
    listPrice: 999,
    productUrl: 'https://www.jackery.com/products/jackery-battery-pack-homepower-2000-plus-v2',
    dealVerifiedOn: '2026-09-23',
    availability: 'in-stock',
    vendorRef: {
      variantId: '44040604876887',
      sku: '21-0008-000050',
      variantTitle: 'Default Title'
    }
  },
  {
    name: 'Battery Pack 3600 Plus',
    brand: 'Jackery',
    icon: 'bi-battery-full',
    batteryCapacity: 3584,
    price: 1349,
    listPrice: 1499,
    productUrl: 'https://www.jackery.com/products/battery-pack-3600-plus',
    dealVerifiedOn: '2026-09-23',
    availability: 'in-stock',
    vendorRef: {
      variantId: '43985714479191',
      sku: '21-0008-000034',
      variantTitle: 'Default Title'
    }
  }
];

assignStableIds(batteries, battery => `${battery.brand}-${battery.name}`);

export { batteries };
