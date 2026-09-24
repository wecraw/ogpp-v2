import { Availability } from './Availability';

// Identifies the exact vendor listing (variant) a record prices, so a refresh can
// match it against a vendor or affiliate-network feed without guessing by name.
// For Shopify stores the variant id and SKU come from `/products/<handle>.js`;
// Shopify-synced affiliate catalogs key their items on the same values.
export interface VendorRef {
  variantId?: string;
  sku?: string;
  // The vendor's own label for the variant, for humans reading refresh diffs.
  variantTitle?: string;
}

export interface ProductPricing {
  price: number;
  listPrice?: number;
  productUrl?: string;
  dealVerifiedOn?: string;
  availability?: Availability;
  vendorRef?: VendorRef;
}
