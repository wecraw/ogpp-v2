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

  // When no curated vendor bundle covers a station, synthesize a complete kit from
  // the catalog so the results page can still recommend a package instead of dead-
  // ending on an empty state. Sizes the station's compatible batteries and panels up
  // to the build's storage/solar targets (never past the station's `maxBatteries` /
  // `maxSolarInput` caps) and prices the result à la carte — the same price the user
  // would pay buying the parts, since there is no fixed-SKU discount to apply.
  // Returns undefined only when there is nothing to add (no compatible solar and the
  // station already meets storage on its own), leaving the empty state for that case.
  buildAutoKit(
    inverter: Inverter,
    batteryTarget: number,
    solarTarget: number,
    batteryOptions: Battery[],
    panelOptions: PowerSource[]
  ): ProductBundleOfferView | undefined {
    const batteryQuantities = this.autoBatteryQuantities(inverter, batteryTarget, batteryOptions);
    const powerSourceQuantities = this.autoPanelQuantities(inverter, solarTarget, panelOptions);

    if (
      Object.keys(batteryQuantities).length === 0 &&
      Object.keys(powerSourceQuantities).length === 0
    ) {
      return undefined;
    }

    const { price, compareAtPrice } = this.alaCarteCost(
      inverter,
      batteryQuantities,
      powerSourceQuantities
    );

    const offer: ProductBundleOffer = {
      id: `auto-${inverter.id}`,
      inverterId: inverter.id ?? '',
      name: 'Recommended kit',
      description: `We sized the ${inverter.brand} ${inverter.name} with matching storage and solar to meet this build's targets.`,
      highlights: this.autoKitHighlights(
        inverter,
        batteryQuantities,
        powerSourceQuantities,
        batteryOptions,
        panelOptions
      ),
      price,
      compareAtPrice,
      batteryQuantities,
      powerSourceQuantities,
      vendor: inverter.brand,
      vendorUrl: inverter.productUrl ?? '',
      verifiedOn: inverter.dealVerifiedOn ?? ''
    };

    return this.toView(offer);
  }

  // How many expansion batteries to add to reach the storage target: the largest
  // compatible battery (fewest units), capped at the station's bank size. None when
  // the built-in battery already meets the target or the station takes no expansions.
  private autoBatteryQuantities(
    inverter: Inverter,
    batteryTarget: number,
    options: Battery[]
  ): Record<string, number> {
    const builtIn = inverter.batteryCapacity ?? 0;
    const maxBatteries = inverter.maxBatteries ?? 0;
    const shortfall = batteryTarget - builtIn;
    if (shortfall <= 0 || maxBatteries <= 0) return {};

    const battery = [...options]
      .filter(item => item.id && item.batteryCapacity > 0)
      .sort((a, b) => b.batteryCapacity - a.batteryCapacity)[0];
    if (!battery?.id) return {};

    const needed = Math.min(Math.ceil(shortfall / battery.batteryCapacity), maxBatteries);
    return needed > 0 ? { [battery.id]: needed } : {};
  }

  // How many panels to add to reach the solar target: the highest-output panel
  // (fewest units), at least one so the kit is a real solar package, but never past
  // the station's solar input ceiling.
  private autoPanelQuantities(
    inverter: Inverter,
    solarTarget: number,
    options: PowerSource[]
  ): Record<string, number> {
    const panel = [...options]
      .filter(item => item.id && item.maxOutput > 0)
      .sort((a, b) => b.maxOutput - a.maxOutput)[0];
    if (!panel?.id) return {};

    const maxByInput = inverter.maxSolarInput
      ? Math.floor(inverter.maxSolarInput / panel.maxOutput)
      : 0;
    if (maxByInput <= 0) return {};

    const needed = Math.min(Math.max(Math.ceil(solarTarget / panel.maxOutput), 1), maxByInput);
    return { [panel.id]: needed };
  }

  private autoKitHighlights(
    inverter: Inverter,
    batteryQuantities: Record<string, number>,
    powerSourceQuantities: Record<string, number>,
    batteryOptions: Battery[],
    panelOptions: PowerSource[]
  ): string[] {
    const highlights: string[] = [inverter.name];
    for (const [id, quantity] of Object.entries(batteryQuantities)) {
      const battery = batteryOptions.find(item => item.id === id);
      if (battery) highlights.push(`${quantity} × ${battery.name}`);
    }
    for (const [id, quantity] of Object.entries(powerSourceQuantities)) {
      const panel = panelOptions.find(item => item.id === id);
      if (panel) highlights.push(`${quantity} × ${panel.name}`);
    }
    return highlights;
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

  // A vendor bundle is a fixed SKU: it is only "active" when the build's gear
  // matches the bundle's quantities exactly. Any deviation (extra battery, a
  // missing panel, a different model) means the build can no longer be bought at
  // the bundle price, so callers fall back to à-la-carte pricing.
  isOfferExact(
    offer: ProductBundleOffer,
    batteryQuantities: Record<string, number>,
    powerSourceQuantities: Record<string, number>
  ): boolean {
    return (
      this.quantitiesMatchExactly(offer.batteryQuantities, batteryQuantities) &&
      this.quantitiesMatchExactly(offer.powerSourceQuantities, powerSourceQuantities)
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

  // The best bundle to recommend as an *upgrade over the user's current build*:
  // one that holds at least as much storage and solar as they've configured, costs
  // no more than their current effective price, and improves on it in at least one
  // dimension. This is a different lens than `getRecommendedOffer` (best fit vs the
  // build's targets) — here we compare against what the user already has and pays,
  // surfacing "more for the same or less." Skips the already-active offer. Ranks by
  // lowest price (biggest saving), then most coverage.
  getBetterBundle(
    offers: ProductBundleOfferView[],
    currentStorage: number,
    currentSolar: number,
    currentPrice: number,
    activeOfferId?: string
  ): ProductBundleOfferView | undefined {
    const upgrades = offers.filter(offer => {
      if (offer.id === activeOfferId) return false;
      const coversStorage = offer.batteryCapacity >= currentStorage;
      const coversSolar = offer.solarWattage >= currentSolar;
      const costsNoMore = offer.price <= currentPrice;
      if (!coversStorage || !coversSolar || !costsNoMore) return false;
      // Require a real improvement so we never nag with an identical package.
      return (
        offer.batteryCapacity > currentStorage ||
        offer.solarWattage > currentSolar ||
        offer.price < currentPrice
      );
    });

    return upgrades.sort((a, b) => {
      if (a.price !== b.price) return a.price - b.price;
      if (a.batteryCapacity !== b.batteryCapacity) return b.batteryCapacity - a.batteryCapacity;
      return b.solarWattage - a.solarWattage;
    })[0];
  }

  // Pre-seeds a build with an offer's required gear, then flattens back into the
  // duplicate-entry arrays the Build interface stores. Shared by checkout and the
  // results page. By default `merge`s the offer's quantities on top of whatever the
  // build already holds (never reducing the user's picks); pass `replace` to set the
  // build's gear to exactly the offer's SKU — used when switching to a recommended
  // package, so the result is a vendor-valid config (no over-stacked extras that
  // could blow past `maxBatteries`).
  applyOfferToBuild(
    build: Build,
    offer: ProductBundleOfferView,
    batteryCatalog: Battery[],
    solarCatalog: PowerSource[],
    mode: 'merge' | 'replace' = 'merge'
  ): Build {
    const batteryQuantities =
      mode === 'replace'
        ? { ...offer.batteryQuantities }
        : this.mergeRequiredQuantities(
            this.groupQuantities(build.batteries ?? []),
            offer.batteryQuantities
          );
    const solarQuantities =
      mode === 'replace'
        ? { ...offer.powerSourceQuantities }
        : this.mergeRequiredQuantities(
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

  private quantitiesMatchExactly(
    required: Record<string, number>,
    selected: Record<string, number>
  ): boolean {
    const ids = new Set([...Object.keys(required), ...Object.keys(selected)]);
    for (const id of ids) {
      if ((required[id] ?? 0) !== (selected[id] ?? 0)) return false;
    }
    return true;
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
