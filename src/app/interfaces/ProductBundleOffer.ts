import { Availability } from './Availability';
import { VendorRef } from './ProductPricing';

// A vendor bundle as authored in `content/product-bundle-offers.ts`: what the vendor
// sells and for how much. The price the app actually quotes is derived from this
// (see `resolveBundleOffer`), so authors never hand-compute it.
export interface ProductBundleOfferSource {
  id: string;
  inverterId: string;
  name: string;
  description: string;
  highlights: string[];
  // The vendor's preset package price, exactly as listed.
  packagePrice: number;
  compareAtPrice: number;
  batteryQuantities: Record<string, number>;
  powerSourceQuantities: Record<string, number>;
  vendor: string;
  vendorUrl: string;
  verifiedOn: string;
  availability?: Availability;
  vendorRef?: VendorRef;
}

export interface ProductBundleOffer {
  id: string;
  inverterId: string;
  name: string;
  description: string;
  highlights: string[];
  price: number;
  presetPrice?: number;
  optimizationNote?: string;
  compareAtPrice: number;
  batteryQuantities: Record<string, number>;
  powerSourceQuantities: Record<string, number>;
  vendor: string;
  vendorUrl: string;
  verifiedOn: string;
  availability?: Availability;
  vendorRef?: VendorRef;
}

export interface ProductBundleOfferView extends ProductBundleOffer {
  batteryCapacity: number;
  solarWattage: number;
  // What buying the same coverage (station + the offer's batteries/panels) costs
  // à la carte at current per-product deal prices, and how much the bundle saves
  // against that. `savingsVsAlaCarte` is negative when the bundle costs more.
  alaCartePrice: number;
  savingsVsAlaCarte: number;
}
