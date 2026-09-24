import { PowerSource } from 'src/app/interfaces/PowerSource';
import { assignStableIds } from './catalog-utils';

let solarPanels: PowerSource[] = [
  {
    name: '400W Portable Solar Panel',
    brand: 'EcoFlow',
    icon: 'bi-bounding-box',
    maxOutput: 400,
    price: 599,
    listPrice: 699,
    productUrl: 'https://us.ecoflow.com/products/400w-portable-solar-panel',
    dealVerifiedOn: '2026-09-23',
    availability: 'in-stock',
    vendorRef: {
      variantId: '39998021697609',
      sku: 'SOLAR400W',
      variantTitle: '400W Portable Solar Panel'
    }
  },
  {
    id: 'ecoflow-220w-bifacial-panel',
    name: '220W Bifacial Solar Panel',
    brand: 'EcoFlow',
    icon: 'bi-bounding-box',
    maxOutput: 220,
    price: 399,
    productUrl: 'https://us.ecoflow.com/products/nextgen-220w-bifacial-portable-solar-panel',
    dealVerifiedOn: '2026-09-23',
    availability: 'in-stock',
    vendorRef: {
      variantId: '41670394576969',
      sku: 'EFSOLAR220W-N',
      variantTitle: 'NextGen 220W Bifacial Portable Solar Panel'
    }
  },
  {
    // No longer listed on EcoFlow US as of 2026-09-23; unverified legacy entry.
    name: '100W Portable Panel',
    brand: 'EcoFlow',
    icon: 'bi-bounding-box',
    maxOutput: 100,
    price: 199,
    availability: 'discontinued'
  },
  {
    // Sold out on the official US page as of 2026-09-23; price is the last verified
    // figure (2026-06-21). Superseded by the PS400 Bifacial below.
    id: 'anker-solix-ps400-panel',
    name: 'SOLIX PS400 Portable Solar Panel',
    brand: 'Anker',
    icon: 'bi-bounding-box',
    maxOutput: 400,
    price: 599,
    listPrice: 699,
    productUrl: 'https://www.ankersolix.com/products/400w-portable-solar-panel',
    dealVerifiedOn: '2026-06-21',
    availability: 'out-of-stock'
  },
  {
    // Verified in-browser (price renders via JS). $699.99 standalone; Anker offers it
    // for $500 as an add-on on the F3800/F3000 pages.
    name: 'SOLIX PS400 Bifacial Portable Solar Panel',
    brand: 'Anker',
    icon: 'bi-bounding-box',
    maxOutput: 400,
    price: 699,
    productUrl: 'https://www.ankersolix.com/products/ps400-bifacial-portable-solar-panel',
    dealVerifiedOn: '2026-09-23',
    availability: 'in-stock'
  },
  {
    // No longer listed on Bluetti US as of 2026-09-23; unverified legacy entry.
    name: 'PV200 Solar Panel',
    brand: 'Bluetti',
    icon: 'bi-bounding-box',
    maxOutput: 200,
    price: 499,
    availability: 'discontinued'
  },
  {
    // Sold out on the official US store as of 2026-09-23 (price still listed).
    name: 'PV120 Solar Panel',
    brand: 'Bluetti',
    icon: 'bi-bounding-box',
    maxOutput: 120,
    price: 209,
    listPrice: 299,
    productUrl: 'https://www.bluettipower.com/products/bluetti-pv120s-solar-panel-120w',
    dealVerifiedOn: '2026-09-23',
    availability: 'out-of-stock',
    vendorRef: {
      variantId: '46032679698651',
      sku: 'PV120S-EU-GY-BL-SPFUS-00',
      variantTitle: '120W Solar Panel | 120W'
    }
  },
  {
    // Bluetti's SP200L.
    name: '200W Portable Solar Panel',
    brand: 'Bluetti',
    icon: 'bi-bounding-box',
    maxOutput: 200,
    price: 399,
    productUrl: 'https://www.bluettipower.com/products/bluetti-sp200l-solar-panel-200w',
    dealVerifiedOn: '2026-09-23',
    availability: 'in-stock',
    vendorRef: {
      variantId: '46104316248283',
      sku: 'PV200-UJ-BK-MD-SPFUS-00',
      variantTitle: '200W Solar Panel | 200W'
    }
  },
  {
    name: '350W Solar Panel',
    brand: 'Bluetti',
    icon: 'bi-bounding-box',
    maxOutput: 350,
    price: 649,
    productUrl: 'https://www.bluettipower.com/products/350w-solar-panel',
    dealVerifiedOn: '2026-09-23',
    availability: 'in-stock',
    vendorRef: {
      variantId: '49045516320987',
      sku: 'PV350-UJ-BK-MD-SPFUS-00',
      variantTitle: '350W Solar Panel | 350W'
    }
  },
  {
    name: 'SolarSaga 200W',
    brand: 'Jackery',
    icon: 'bi-bounding-box',
    maxOutput: 200,
    price: 379,
    listPrice: 429,
    productUrl: 'https://www.jackery.com/products/solarsaga-200w-solar-panel',
    dealVerifiedOn: '2026-09-23',
    availability: 'in-stock',
    vendorRef: {
      variantId: '39263317000279',
      sku: '21-0002-000063',
      variantTitle: 'Default Title'
    }
  },
  {
    // Only sold refurbished on jackery.com as of 2026-09-23; unverified legacy entry.
    name: 'SolarSaga 100W',
    brand: 'Jackery',
    icon: 'bi-bounding-box',
    maxOutput: 100,
    price: 249,
    availability: 'discontinued'
  },
  {
    name: 'SolarSaga 500 X',
    brand: 'Jackery',
    icon: 'bi-bounding-box',
    maxOutput: 500,
    price: 799,
    listPrice: 999,
    productUrl: 'https://www.jackery.com/products/jackery-solarsaga-500-x',
    dealVerifiedOn: '2026-09-23',
    availability: 'in-stock',
    vendorRef: {
      variantId: '41317177000023',
      sku: '21-0002-000093',
      variantTitle: 'Default Title'
    }
  }
];

assignStableIds(solarPanels, panel => `${panel.brand}-${panel.name}`);

export { solarPanels };
