import { Injectable } from '@angular/core';
import { batteries } from 'src/app/content/batteries';
import { inverters } from 'src/app/content/inverters';
import { productBundleOffers } from 'src/app/content/product-bundle-offers';
import { solarPanels } from 'src/app/content/solarPanels';
import { Battery } from 'src/app/interfaces/Battery';
import { Build } from 'src/app/interfaces/Build';
import { Inverter } from 'src/app/interfaces/Inverter';
import { PowerSource } from 'src/app/interfaces/PowerSource';
import {
  ProductBundleOffer,
  ProductBundleOfferView
} from 'src/app/interfaces/ProductBundleOffer';

export interface AlaCarteCost {
  price: number;
  compareAtPrice: number;
}

@Injectable({
  providedIn: 'root'
})
export class ProductDealsService {
  getOffersForInverter(inverterId?: string): ProductBundleOfferView[] {
    if (!inverterId) return [];

    return productBundleOffers
      .filter(offer => offer.inverterId === inverterId)
      .map(offer => this.toView(offer));
  }

  getRecommendedOffer(
    offers: ProductBundleOfferView[],
    batteryTarget: number,
    solarTarget: number
  ): ProductBundleOfferView | undefined {
    const ranked = [...offers].sort((a, b) => {
      const aMeetsTargets =
        a.batteryCapacity >= batteryTarget && a.solarWattage >= solarTarget;
      const bMeetsTargets =
        b.batteryCapacity >= batteryTarget && b.solarWattage >= solarTarget;

      if (aMeetsTargets !== bMeetsTargets) return aMeetsTargets ? -1 : 1;

      const coverageDifference =
        this.coverageScore(b, batteryTarget, solarTarget) -
        this.coverageScore(a, batteryTarget, solarTarget);
      if (coverageDifference !== 0) return coverageDifference;

      return a.price - b.price;
    });

    return ranked[0];
  }

  isOfferSatisfied(
    offer: ProductBundleOffer,
    batteryQuantities: Record<string, number>,
    powerSourceQuantities: Record<string, number>
  ): boolean {
    return (
      this.includesRequiredQuantities(offer.batteryQuantities, batteryQuantities) &&
      this.includesRequiredQuantities(offer.powerSourceQuantities, powerSourceQuantities)
    );
  }

  // The cost of buying a station plus the given battery/solar quantities one
  // product at a time, at current per-product deal prices. `price` uses each
  // product's `price`; `compareAtPrice` uses `listPrice` (falling back to
  // `price` when a product carries no list price).
  alaCarteCost(
    inverter: Inverter | undefined,
    batteryQuantities: Record<string, number>,
    solarQuantities: Record<string, number>
  ): AlaCarteCost {
    let price = inverter?.price ?? 0;
    let compareAtPrice = inverter?.listPrice ?? inverter?.price ?? 0;

    for (const [id, quantity] of Object.entries(batteryQuantities)) {
      const battery = batteries.find(item => item.id === id);
      if (!battery || quantity <= 0) continue;
      price += battery.price * quantity;
      compareAtPrice += (battery.listPrice ?? battery.price) * quantity;
    }

    for (const [id, quantity] of Object.entries(solarQuantities)) {
      const panel = solarPanels.find(item => item.id === id);
      if (!panel || quantity <= 0) continue;
      price += panel.price * quantity;
      compareAtPrice += (panel.listPrice ?? panel.price) * quantity;
    }

    return { price, compareAtPrice };
  }

  // Pre-seeds a build with an offer's required gear: merges the offer's required
  // quantities into whatever the build already holds (never reducing below the
  // user's existing picks), then flattens back into the duplicate-entry arrays
  // the Build interface stores. Shared by checkout and the results page.
  applyOfferToBuild(
    build: Build,
    offer: ProductBundleOfferView,
    batteryCatalog: Battery[],
    solarCatalog: PowerSource[]
  ): Build {
    const batteryQuantities = this.mergeRequiredQuantities(
      this.groupQuantities(build.batteries ?? []),
      offer.batteryQuantities
    );
    const solarQuantities = this.mergeRequiredQuantities(
      this.groupQuantities(build.powerSources ?? []),
      offer.powerSourceQuantities
    );

    build.bundleOfferId = offer.id;
    build.batteries = this.flatten(batteryCatalog, batteryQuantities);
    build.powerSources = this.flatten(solarCatalog, solarQuantities);
    return build;
  }

  private toView(offer: ProductBundleOffer): ProductBundleOfferView {
    const inverterCapacity =
      inverters.find(inverter => inverter.id === offer.inverterId)?.batteryCapacity ?? 0;
    const batteryCapacity = Object.entries(offer.batteryQuantities).reduce(
      (total, [id, quantity]) => {
        const battery = batteries.find(item => item.id === id);
        return total + (battery?.batteryCapacity ?? 0) * quantity;
      },
      inverterCapacity
    );
    const solarWattage = Object.entries(offer.powerSourceQuantities).reduce(
      (total, [id, quantity]) => {
        const panel = solarPanels.find(item => item.id === id);
        return total + (panel?.maxOutput ?? 0) * quantity;
      },
      0
    );

    const inverter = inverters.find(item => item.id === offer.inverterId);
    const { price: alaCartePrice } = this.alaCarteCost(
      inverter,
      offer.batteryQuantities,
      offer.powerSourceQuantities
    );

    return {
      ...offer,
      batteryCapacity,
      solarWattage,
      alaCartePrice,
      savingsVsAlaCarte: alaCartePrice - offer.price
    };
  }

  private coverageScore(
    offer: ProductBundleOfferView,
    batteryTarget: number,
    solarTarget: number
  ): number {
    const batteryCoverage = batteryTarget
      ? Math.min(offer.batteryCapacity / batteryTarget, 1)
      : 1;
    const solarCoverage = solarTarget ? Math.min(offer.solarWattage / solarTarget, 1) : 1;
    return batteryCoverage + solarCoverage;
  }

  private includesRequiredQuantities(
    required: Record<string, number>,
    selected: Record<string, number>
  ): boolean {
    return Object.entries(required).every(
      ([id, quantity]) => (selected[id] ?? 0) >= quantity
    );
  }

  private mergeRequiredQuantities(
    selected: Record<string, number>,
    required: Record<string, number>
  ): Record<string, number> {
    const merged = { ...selected };
    for (const [id, quantity] of Object.entries(required)) {
      merged[id] = Math.max(merged[id] ?? 0, quantity);
    }
    return merged;
  }

  private groupQuantities(items: { id?: string }[]): Record<string, number> {
    const quantities: Record<string, number> = {};
    for (const item of items) {
      if (!item.id) continue;
      quantities[item.id] = (quantities[item.id] ?? 0) + 1;
    }
    return quantities;
  }

  private flatten<T extends { id?: string }>(
    items: T[],
    quantities: Record<string, number>
  ): T[] {
    const result: T[] = [];
    for (const item of items) {
      const quantity = item.id ? quantities[item.id] ?? 0 : 0;
      for (let index = 0; index < quantity; index++) {
        result.push(item);
      }
    }
    return result;
  }
}
