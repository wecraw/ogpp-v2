import { Injectable } from '@angular/core';
import { batteries } from 'src/app/content/batteries';
import { inverters } from 'src/app/content/inverters';
import { productBundleOffers } from 'src/app/content/product-bundle-offers';
import { solarPanels } from 'src/app/content/solarPanels';
import {
  ProductBundleOffer,
  ProductBundleOfferView
} from 'src/app/interfaces/ProductBundleOffer';

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

    return {
      ...offer,
      batteryCapacity,
      solarWattage
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
}
