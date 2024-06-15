import { Injectable } from '@angular/core';
import { Inverter } from 'src/app/interfaces/Inverter';
import { inverters } from 'src/app/content/inverters'; // Assuming the inverter data is in a separate file
import { Build } from 'src/app/interfaces/Build';
import { CalculationUtilsService } from './calculation-utils.service';

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
}
