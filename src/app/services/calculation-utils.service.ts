import { Injectable } from '@angular/core';
import { Season } from '../interfaces/Season';
import { Build } from '../interfaces/Build';

@Injectable({
  providedIn: 'root'
})
export class CalculationUtilsService {
  constructor() {}

  getSunHoursBySeason(build: Build): number {
    const seasonMonthsMap: { [season in Season]: string[] } = {
      winter: ['dec', 'jan', 'feb'],
      spring: ['mar', 'apr', 'may'],
      summer: ['jun', 'jul', 'aug'],
      fall: ['sep', 'oct', 'nov']
    };

    const selectedMonths = build.seasons.reduce<string[]>((months, season) => {
      if (seasonMonthsMap[season]) {
        months.push(...seasonMonthsMap[season]);
      }
      return months;
    }, []);

    const selectedValues = selectedMonths.map(month => build.monthlyGhi[month]);
    return Math.min(...selectedValues);
  }

  peakWattage(build: Build): number {
    return build.appliances.reduce((total, appliance) => {
      return total + appliance.wattage * appliance.quantity;
    }, 0);
  }

  totalWattHours(build: Build): number {
    return build.appliances.reduce((total, appliance) => {
      return total + appliance.wattage * appliance.hours * appliance.quantity;
    }, 0);
  }

  wattageNeeded(build: Build) {
    return Math.ceil(this.totalWattHours(build) / this.getSunHoursBySeason(build));
  }
}
