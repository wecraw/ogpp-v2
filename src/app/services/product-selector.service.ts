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

  // Batteries are matched to the chosen inverter by brand. If the inverter's brand
  // has no batteries in the catalog, fall back to the full list so the flow never
  // dead-ends.
  getMatchingBatteries(build: Build): Battery[] {
    const compatibleIds = build.inverter?.compatibleBatteryIds;
    if (compatibleIds?.length) {
      const compatible = batteries.filter(battery =>
        battery.id ? compatibleIds.includes(battery.id) : false
      );
      if (compatible.length) return compatible;
    }

    const brand = build.inverter?.brand;
    const brandMatches = brand
      ? batteries.filter(battery => battery.brand === brand)
      : [];
    return brandMatches.length > 0 ? brandMatches : batteries;
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
