import { Inject, Injectable } from '@angular/core';
import { Inverter } from 'src/app/interfaces/Inverter';
import { CATALOG, Catalog } from 'src/app/content/catalog';
import { isPurchasable } from 'src/app/interfaces/Availability';
import { Build } from 'src/app/interfaces/Build';
import { CalculationUtilsService } from './calculation-utils.service';
import { Battery } from '../interfaces/Battery';
import { PowerSource } from '../interfaces/PowerSource';

@Injectable({
  providedIn: 'root'
})
export class ProductSelectorService {
  constructor(
    private calculationUtils: CalculationUtilsService,
    @Inject(CATALOG) private catalog: Catalog
  ) {}

  // Discontinued stations stay in the catalog so saved builds still rehydrate, but
  // they're only offered here when the build already uses one. Sold-out stations
  // remain listed (with a status chip) since they're expected back in stock.
  getMatchingInverters(build: Build): Inverter[] {
    const peakWattage = this.calculationUtils.peakWattage(build);
    const availableInverters = this.catalog.inverters
      .filter(
        inverter =>
          inverter.availability !== 'discontinued' || inverter.id === build.inverter?.id
      )
      .sort((first, second) => second.maxOutput - first.maxOutput);

    if (!Number.isFinite(peakWattage) || peakWattage <= 0) {
      return availableInverters;
    }

    const matches = availableInverters.filter(inverter => inverter.maxOutput >= peakWattage);

    // An oversized build should still show the catalog. The page explains that none of
    // these single stations meets the target instead of presenting an unexplained blank state.
    return matches.length > 0 ? matches : availableInverters;
  }

  // The recommendation anchor: the smallest single station that fits the build.
  // `getMatchingInverters` returns peak-qualifying units sorted descending by
  // `maxOutput`, so the smallest is the last element. When storage/solar targets
  // are supplied we prefer the smallest station that *also* reaches both within its
  // caps, so the recommendation lands on a station that needs no step-up rather than
  // anchoring on the smallest peak-covering unit and then nagging the user to upsize.
  // Falls back to the smallest peak-covering station when no single unit can reach
  // the targets. Returns undefined when nothing covers the peak load. Stations that
  // can't be ordered today (sold out / discontinued) are only anchored on when no
  // purchasable station covers the peak.
  getAnchorInverter(
    build: Build,
    batteryTarget?: number,
    solarTarget?: number
  ): Inverter | undefined {
    const peakWattage = this.calculationUtils.peakWattage(build);
    const matches = this.getMatchingInverters(build);

    const peakQualifying =
      Number.isFinite(peakWattage) && peakWattage > 0
        ? matches.filter(inverter => inverter.maxOutput >= peakWattage)
        : matches;
    const purchasable = peakQualifying.filter(inverter => isPurchasable(inverter.availability));
    const qualifying = purchasable.length > 0 ? purchasable : peakQualifying;

    if (qualifying.length === 0) return undefined;

    if (batteryTarget !== undefined && solarTarget !== undefined) {
      const meetsTargets = qualifying.filter(inverter =>
        this.inverterMeetsTargets(inverter, batteryTarget, solarTarget)
      );
      if (meetsTargets.length > 0) return meetsTargets[meetsTargets.length - 1];
    }

    return qualifying[qualifying.length - 1];
  }

  // Batteries are matched to the chosen inverter by brand. If the inverter's brand
  // has no batteries in the catalog, fall back to the full list so the flow never
  // dead-ends.
  getMatchingBatteries(build: Build): Battery[] {
    return build.inverter ? this.batteriesForInverter(build.inverter) : this.catalog.batteries;
  }

  // Same matching logic as `getMatchingBatteries`, keyed off a bare inverter so the
  // step-up sizing can ask "what's the most storage this station could ever hold?"
  // without a full Build in hand.
  private batteriesForInverter(inverter: Inverter): Battery[] {
    // A station with no expansion port takes no batteries; don't fall back to the
    // brand/full catalog and offer cards the user can never add.
    if (inverter.maxBatteries === 0) return [];

    const batteries = this.catalog.batteries;
    const compatibleIds = inverter.compatibleBatteryIds;
    if (compatibleIds?.length) {
      const compatible = batteries.filter(battery =>
        battery.id ? compatibleIds.includes(battery.id) : false
      );
      if (compatible.length) return compatible;
    }

    const brand = inverter.brand;
    const brandMatches = brand ? batteries.filter(battery => battery.brand === brand) : [];
    return brandMatches.length > 0 ? brandMatches : batteries;
  }

  // The most a station can store: its built-in battery plus a full bank of the
  // largest expansion battery it accepts (`maxBatteries` is a bank total — see
  // BuildComponent's cap getters). Only purchasable batteries count, so anchor and
  // step-up picks reflect storage the user can actually buy; the unavailable records
  // stay in `batteriesForInverter` so saved builds still restore.
  private maxStorageCapacity(inverter: Inverter): number {
    const builtIn = inverter.batteryCapacity ?? 0;
    const maxBatteries = inverter.maxBatteries ?? 0;
    const largestBattery = this.batteriesForInverter(inverter)
      .filter(battery => isPurchasable(battery.availability))
      .reduce((largest, battery) => Math.max(largest, battery.batteryCapacity ?? 0), 0);
    return builtIn + maxBatteries * largestBattery;
  }

  // Whether a station can reach both demand targets without exceeding its own caps:
  // solar input must cover the panel target, and a full battery bank must cover the
  // storage target.
  private inverterMeetsTargets(
    inverter: Inverter,
    batteryTarget: number,
    solarTarget: number
  ): boolean {
    return (
      inverter.maxSolarInput >= solarTarget && this.maxStorageCapacity(inverter) >= batteryTarget
    );
  }

  // Step-up recommendation: when the build's current (anchor) station can't reach the
  // storage/solar targets within its caps — its `maxSolarInput` is below the panel
  // target, or a full battery bank still falls short of the storage target — return
  // the smallest larger same-brand station that *can* (e.g. DELTA Pro → DELTA Pro 3 /
  // Ultra). Only purchasable stations are suggested. Returns undefined when the anchor
  // already fits or no larger sibling does.
  getStepUpInverter(
    build: Build,
    batteryTarget: number,
    solarTarget: number
  ): Inverter | undefined {
    const anchor = build.inverter;
    if (!anchor?.maxOutput) return undefined;
    if (this.inverterMeetsTargets(anchor, batteryTarget, solarTarget)) return undefined;

    const peakWattage = this.calculationUtils.peakWattage(build);

    return this.catalog.inverters
      .filter(
        inverter =>
          inverter.brand === anchor.brand &&
          isPurchasable(inverter.availability) &&
          inverter.maxOutput > anchor.maxOutput &&
          inverter.maxOutput >= peakWattage &&
          this.inverterMeetsTargets(inverter, batteryTarget, solarTarget)
      )
      .sort((first, second) => first.maxOutput - second.maxOutput)[0];
  }

  // Solar panels use the same brand-match-with-fallback strategy as batteries.
  getMatchingSolarPanels(build: Build): PowerSource[] {
    const solarPanels = this.catalog.solarPanels;
    const compatibleIds = build.inverter?.compatiblePowerSourceIds;
    if (compatibleIds?.length) {
      const compatible = solarPanels.filter(panel =>
        panel.id ? compatibleIds.includes(panel.id) : false
      );
      if (compatible.length) return compatible;
    }

    const brand = build.inverter?.brand;
    const brandMatches = brand ? solarPanels.filter(panel => panel.brand === brand) : [];
    return brandMatches.length > 0 ? brandMatches : solarPanels;
  }
}
