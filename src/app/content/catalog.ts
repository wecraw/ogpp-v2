import { InjectionToken } from '@angular/core';
import { ProductBundleOffer } from 'src/app/interfaces/ProductBundleOffer';
import { batteries } from './batteries';
import { inverters } from './inverters';
import { ProductCatalogs } from './offer-pricing';
import { productBundleOffers } from './product-bundle-offers';
import { solarPanels } from './solarPanels';

export interface Catalog extends ProductCatalogs {
  bundleOffers: ProductBundleOffer[];
}

export const LIVE_CATALOG: Catalog = {
  inverters,
  batteries,
  solarPanels,
  bundleOffers: productBundleOffers
};

// Everything that reads product data injects this instead of importing the catalog
// files, so specs can supply a frozen fixture (`src/testing/catalog-fixture.ts`) and
// stop breaking whenever vendor prices are refreshed.
export const CATALOG = new InjectionToken<Catalog>('CATALOG', {
  providedIn: 'root',
  factory: () => LIVE_CATALOG
});
