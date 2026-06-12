export type OfferAvailability = 'available' | 'check-vendor' | 'sold-out';

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
  availability: OfferAvailability;
}

export interface ProductBundleOfferView extends ProductBundleOffer {
  batteryCapacity: number;
  solarWattage: number;
}
