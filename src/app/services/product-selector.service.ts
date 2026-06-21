import { Injectable } from '@angular/core';
import { Inverter } from 'src/app/interfaces/Inverter';
import { inverters } from 'src/app/content/inverters'; // Assuming the inverter data is in a separate file
import { batteries } from 'src/app/content/batteries';
import { solarPanels } from 'src/app/content/solarPanels';
import { Build } from 'src/app/interfaces/Build';
import { CalculationUtilsService } from './calculation-utils.service';
import { Battery } from '../interfaces/Battery';
import { PowerSource } from '../interfaces/PowerSource';

@Injectable({
  providedIn: 'root'
})
export class ProductSelectorService {
  constructor(private calculationUtils: CalculationUtilsService) {}

  getMatchingInverters(build: Build): Inverter[] {
    const peakWattage = this.calculationUtils.peakWattage(build);
    const availableInverters = [...inverters].sort(
      (first, second) => second.maxOutput - first.maxOutput
    );

    if (!Number.isFinite(peakWattage) || peakWattage <= 0) {
      return availableInverters;
    }

    const matches = availableInverters.filter(inverter => inverter.maxOutput >= peakWattage);

    // An oversized build should still show the catalog. The page explains that none of
    // these single stations meets the target instead of presenting an unexplained blank state.
    return matches.length > 0 ? matches : availableInverters;
  }

  // The recommendation anchor: the smallest single station that still covers the
  // build's peak load. `getMatchingInverters` returns qualifying units sorted
  // descending by `maxOutput`, so the best fit is the last qualifying element.
  // Returns undefined when no single station can meet the load (the matcher then
  // falls back to the full catalog, none of which qualifies).
  getAnchorInverter(build: Build): Inverter | undefined {
    const peakWattage = this.calculationUtils.peakWattage(build);
    const matches = this.getMatchingInverters(build);

    const qualifying =
      Number.isFinite(peakWattage) && peakWattage > 0
        ? matches.filter(inverter => inverter.maxOutput >= peakWattage)
        : matches;

    return qualifying.length > 0 ? qualifying[qualifying.length - 1] : undefined;
  }

  // Batteries are matched to the chosen inverter by brand. If the inverter's brand
  // has no batteries in the catalog, fall back to the full list so the flow never
  // dead-ends.
  getMatchingBatteries(build: Build): Battery[] {
    return build.inverter ? this.batteriesForInverter(build.inverter) : batteries;
  }

  // Same matching logic as `getMatchingBatteries`, keyed off a bare inverter so the
  // step-up sizing can ask "what's the most storage this station could ever hold?"
  // without a full Build in hand.
  private batteriesForInverter(inverter: Inverter): Battery[] {
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
  // BuildComponent's cap getters).
  private maxStorageCapacity(inverter: Inverter): number {
    const builtIn = inverter.batteryCapacity ?? 0;
    const maxBatteries = inverter.maxBatteries ?? 0;
    const largestBattery = this.batteriesForInverter(inverter).reduce(
      (largest, battery) => Math.max(largest, battery.batteryCapacity ?? 0),
      0
    );
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
  // Ultra). Returns undefined when the anchor already fits or no larger sibling does.
  getStepUpInverter(
    build: Build,
    batteryTarget: number,
    solarTarget: number
  ): Inverter | undefined {
    const anchor = build.inverter;
    if (!anchor?.maxOutput) return undefined;
    if (this.inverterMeetsTargets(anchor, batteryTarget, solarTarget)) return undefined;

    const peakWattage = this.calculationUtils.peakWattage(build);

    return inverters
      .filter(
        inverter =>
          inverter.brand === anchor.brand &&
          inverter.maxOutput > anchor.maxOutput &&
          inverter.maxOutput >= peakWattage &&
          this.inverterMeetsTargets(inverter, batteryTarget, solarTarget)
      )
      .sort((first, second) => first.maxOutput - second.maxOutput)[0];
  }

  // Solar panels use the same brand-match-with-fallback strategy as batteries.
  getMatchingSolarPanels(build: Build): PowerSource[] {
    const compatibleIds = build.inverter?.compatiblePowerSourceIds;
    if (compatibleIds?.length) {
      const compatible = solarPanels.filter(panel =>
        panel.id ? compatibleIds.includes(panel.id) : false
      );
      if (compatible.length) return compatible;
    }

    const brand = build.inverter?.brand;
    const brandMatches = brand
      ? solarPanels.filter(panel => panel.brand === brand)
      : [];
    return brandMatches.length > 0 ? brandMatches : solarPanels;
  }
}
