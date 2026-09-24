// Stock state for a product or vendor bundle. Mirrors the affiliate-network feed
// values (e.g. impact.com `StockAvailability`: InStock / OutOfStock / PreOrder) plus
// `discontinued`, which feeds don't carry but we record when a vendor drops a
// product. Leave it unset when stock hasn't been verified.
export type Availability = 'in-stock' | 'out-of-stock' | 'preorder' | 'discontinued';

// Whether something can be ordered right now. Unverified (undefined) counts as
// purchasable so an unannotated catalog behaves exactly as before.
export function isPurchasable(availability?: Availability): boolean {
  return availability !== 'out-of-stock' && availability !== 'discontinued';
}

// Short user-facing status for anything other than a plain in-stock item.
export function availabilityLabel(availability?: Availability): string | undefined {
  switch (availability) {
    case 'out-of-stock':
      return 'Sold out';
    case 'preorder':
      return 'Pre-order';
    case 'discontinued':
      return 'Discontinued';
    default:
      return undefined;
  }
}
