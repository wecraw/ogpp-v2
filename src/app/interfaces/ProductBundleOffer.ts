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
