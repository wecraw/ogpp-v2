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

    return inverters.filter(inverter => {
      return inverter.maxOutput !== undefined && inverter.maxOutput >= peakWattage;
    });
  }

  // Batteries are matched to the chosen inverter by brand. If the inverter's brand
  // has no batteries in the catalog, fall back to the full list so the flow never
  // dead-ends.
  getMatchingBatteries(build: Build): Battery[] {
    const brand = build.inverter?.brand;
    const brandMatches = brand
      ? batteries.filter(battery => battery.brand === brand)
      : [];
    return brandMatches.length > 0 ? brandMatches : batteries;
  }

  // Solar panels use the same brand-match-with-fallback strategy as batteries.
  getMatchingSolarPanels(build: Build): PowerSource[] {
    const brand = build.inverter?.brand;
    const brandMatches = brand
      ? solarPanels.filter(panel => panel.brand === brand)
      : [];
    return brandMatches.length > 0 ? brandMatches : solarPanels;
  }
}
