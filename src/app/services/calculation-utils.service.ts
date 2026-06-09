import { Injectable } from '@angular/core';
import { Season } from '../interfaces/Season';
import { Build, Month } from '../interfaces/Build';

@Injectable({
  providedIn: 'root'
})
export class CalculationUtilsService {
  constructor() {}

  getSunHoursBySeason(build: Build): number {
    const seasonMonthsMap: { [season in Season]: Month[] } = {
      winter: ['dec', 'jan', 'feb'],
      spring: ['mar', 'apr', 'may'],
      summer: ['jun', 'jul', 'aug'],
      fall: ['sep', 'oct', 'nov']
    };

    const selectedMonths = build.seasons.reduce<Month[]>((months, season) => {
      if (seasonMonthsMap[season]) {
        months.push(...seasonMonthsMap[season]);
      }
      return months;
    }, []);

    const monthlyGhi = build.monthlyGhi;
    if (monthlyGhi) {
      const selectedValues = selectedMonths.map(month => monthlyGhi[month]);
      return Math.min(...selectedValues);
    } else {
      // Handle the case when build.monthlyGhi is null
      console.warn('build.monthlyGhi is null. Returning a default value.');
      return 0; // or any other default value you want to use
    }
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

  wattageNeeded(build: Build): number {
    const sunHours = this.getSunHoursBySeason(build);
    if (sunHours <= 0) {
      console.warn('Sun hours is zero or unavailable; cannot compute wattage needed.');
      return 0;
    }
    return Math.ceil(this.totalWattHours(build) / sunHours);
  }
}
