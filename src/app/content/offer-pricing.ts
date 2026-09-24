import { isPurchasable } from 'src/app/interfaces/Availability';
import { Battery } from 'src/app/interfaces/Battery';
import { Inverter } from 'src/app/interfaces/Inverter';
import { PowerSource } from 'src/app/interfaces/PowerSource';
import {
  ProductBundleOffer,
  ProductBundleOfferSource
} from 'src/app/interfaces/ProductBundleOffer';

export interface ProductCatalogs {
  inverters: Inverter[];
  batteries: Battery[];
  solarPanels: PowerSource[];
}

export interface AlaCarteCost {
  price: number;
  compareAtPrice: number;
  // False when any priced part is sold out or discontinued, so the sum isn't a
  // price anyone can actually pay today.
  purchasable: boolean;
}

// The cost of buying a station plus the given battery/solar quantities one product
// at a time. `price` uses each product's `price`; `compareAtPrice` uses `listPrice`
// (falling back to `price`). Unknown ids and non-positive quantities are skipped.
export function alaCarteCost(
  catalogs: ProductCatalogs,
  inverter: Inverter | undefined,
  batteryQuantities: Record<string, number>,
  solarQuantities: Record<string, number>
): AlaCarteCost {
  let price = inverter?.price ?? 0;
  let compareAtPrice = inverter?.listPrice ?? inverter?.price ?? 0;
  let purchasable = inverter ? isPurchasable(inverter.availability) : true;

  const add = (items: (Battery | PowerSource)[], quantities: Record<string, number>): void => {
    for (const [id, quantity] of Object.entries(quantities)) {
      const item = items.find(candidate => candidate.id === id);
      if (!item || quantity <= 0) continue;
      price += item.price * quantity;
      compareAtPrice += (item.listPrice ?? item.price) * quantity;
      purchasable = purchasable && isPurchasable(item.availability);
    }
  };
  add(catalogs.batteries, batteryQuantities);
  add(catalogs.solarPanels, solarQuantities);

  return { price, compareAtPrice, purchasable };
}

const usd = (amount: number): string => `$${amount.toLocaleString('en-US')}`;

// Turns an authored vendor bundle into the offer the app quotes. The quoted `price`
// is the cheaper of the vendor's preset package and buying the same parts one at a
// time — but the parts only count when every one of them can be bought today. When
// the parts win, the package price is kept as `presetPrice`. The one-line
// `optimizationNote` is generated so the explanation always matches the numbers.
export function resolveBundleOffer(
  source: ProductBundleOfferSource,
  catalogs: ProductCatalogs
): ProductBundleOffer {
  const { packagePrice, ...offer } = source;
  const inverter = catalogs.inverters.find(item => item.id === source.inverterId);
  const parts = alaCarteCost(
    catalogs,
    inverter,
    source.batteryQuantities,
    source.powerSourceQuantities
  );

  if (parts.purchasable && parts.price < packagePrice) {
    return {
      ...offer,
      price: parts.price,
      presetPrice: packagePrice,
      optimizationNote: `Buying the parts separately is ${usd(packagePrice - parts.price)} less than ${source.vendor}’s preset package.`
    };
  }

  let optimizationNote: string | undefined;
  if (!parts.purchasable) {
    optimizationNote = `Some of these parts aren’t sold separately right now, so ${source.vendor}’s preset package is the way to buy them together.`;
  } else if (parts.price > packagePrice) {
    optimizationNote = `${source.vendor}’s preset package is ${usd(parts.price - packagePrice)} less than buying the parts separately.`;
  }

  return {
    ...offer,
    price: packagePrice,
    ...(optimizationNote ? { optimizationNote } : {})
  };
}

export function resolveBundleOffers(
  sources: ProductBundleOfferSource[],
  catalogs: ProductCatalogs
): ProductBundleOffer[] {
  return sources.map(source => resolveBundleOffer(source, catalogs));
}
