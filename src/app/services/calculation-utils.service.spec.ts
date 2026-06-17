import { TestBed } from '@angular/core/testing';

import { CalculationUtilsService } from './calculation-utils.service';
import { Build, defaultBuild, MonthlyGhi } from '../interfaces/Build';
import { Appliance } from '../interfaces/Appliance';

describe('CalculationUtilsService', () => {
  let service: CalculationUtilsService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(CalculationUtilsService);
  });

  const appliance = (overrides: Partial<Appliance>): Appliance => ({
    name: 'Test',
    wattage: 0,
    hours: 1,
    quantity: 1,
    applianceGroup: 'Test',
    ...overrides
  });

  const monthlyGhi = (overrides: Partial<MonthlyGhi> = {}): MonthlyGhi => ({
    jan: 2.1,
    feb: 3.2,
    mar: 4.3,
    apr: 5.4,
    may: 6.5,
    jun: 7.6,
    jul: 8.7,
    aug: 6.8,
    sep: 5.9,
    oct: 4.8,
    nov: 3.7,
    dec: 1.9,
    ...overrides
  });

  const buildWith = (
    appliances: Appliance[],
    overrides: Partial<Build> = {}
  ): Build => ({
    ...defaultBuild,
    appliances,
    seasons: ['summer'],
    monthlyGhi: monthlyGhi(),
    ...overrides
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('peakWattage (coincident-load model)', () => {
    it('sums continuous loads in full', () => {
      const build = buildWith([
        appliance({ wattage: 353, usageType: 'continuous' }),
        appliance({ wattage: 100, usageType: 'continuous' })
      ]);
      expect(service.peakWattage(build)).toBe(453);
    });

    it('treats appliances without a usageType as continuous', () => {
      const build = buildWith([appliance({ wattage: 353 }), appliance({ wattage: 100 })]);
      expect(service.peakWattage(build)).toBe(453);
    });

    it('multiplies continuous loads by quantity', () => {
      const build = buildWith([appliance({ wattage: 10, quantity: 6, usageType: 'continuous' })]);
      expect(service.peakWattage(build)).toBe(60);
    });

    it('counts only the single largest intermittent load', () => {
      const build = buildWith([
        appliance({ wattage: 5000, usageType: 'intermittent' }), // dryer
        appliance({ wattage: 1500, usageType: 'intermittent' }), // kettle
        appliance({ wattage: 1200, usageType: 'intermittent' }) // iron
      ]);
      expect(service.peakWattage(build)).toBe(5000);
    });

    it('does not multiply the largest intermittent load by its quantity', () => {
      const build = buildWith([
        appliance({ wattage: 1500, quantity: 3, usageType: 'intermittent' })
      ]);
      expect(service.peakWattage(build)).toBe(1500);
    });

    it('adds continuous total plus the single largest intermittent load', () => {
      const build = buildWith([
        appliance({ wattage: 353, usageType: 'continuous' }), // fridge
        appliance({ wattage: 100, usageType: 'continuous' }), // tv
        appliance({ wattage: 5000, usageType: 'intermittent' }), // dryer
        appliance({ wattage: 1500, usageType: 'intermittent' }) // kettle
      ]);
      expect(service.peakWattage(build)).toBe(453 + 5000);
    });

    it('returns 0 for an empty appliance list', () => {
      expect(service.peakWattage(buildWith([]))).toBe(0);
    });
  });

  describe('totalWattHours', () => {
    it('sums wattage times daily hours times quantity', () => {
      const build = buildWith([
        appliance({ wattage: 100, hours: 3, quantity: 2 }),
        appliance({ wattage: 45, hours: 4, quantity: 1 })
      ]);

      expect(service.totalWattHours(build)).toBe(780);
    });

    it('returns 0 for an empty appliance list', () => {
      expect(service.totalWattHours(buildWith([]))).toBe(0);
    });
  });

  describe('getSunHoursBySeason', () => {
    it('uses the lowest monthly GHI from the selected season', () => {
      const build = buildWith([], {
        seasons: ['winter'],
        monthlyGhi: monthlyGhi({ dec: 1.7, jan: 2.4, feb: 3.1 })
      });

      expect(service.getSunHoursBySeason(build)).toBe(1.7);
    });

    it('uses the lowest monthly GHI across multiple selected seasons', () => {
      const build = buildWith([], {
        seasons: ['spring', 'fall'],
        monthlyGhi: monthlyGhi({ mar: 3.4, sep: 2.8, nov: 3.2 })
      });

      expect(service.getSunHoursBySeason(build)).toBe(2.8);
    });

    it('returns 0 and warns when monthly GHI is missing', () => {
      spyOn(console, 'warn');

      const sunHours = service.getSunHoursBySeason(
        buildWith([], {
          seasons: ['summer'],
          monthlyGhi: null
        })
      );

      expect(sunHours).toBe(0);
      expect(console.warn).toHaveBeenCalledWith(
        'build.monthlyGhi is null. Returning a default value.'
      );
    });
  });

  describe('wattageNeeded', () => {
    it('rounds daily watt-hours up against worst-season sun hours', () => {
      const build = buildWith(
        [appliance({ wattage: 333, hours: 1, quantity: 1 })],
        {
          seasons: ['summer'],
          monthlyGhi: monthlyGhi({ jun: 5, jul: 5, aug: 5 })
        }
      );

      expect(service.wattageNeeded(build)).toBe(67);
    });

    it('returns 0 and warns when sun hours are unavailable', () => {
      spyOn(console, 'warn');
      const build = buildWith(
        [appliance({ wattage: 100, hours: 3, quantity: 1 })],
        {
          seasons: ['summer'],
          monthlyGhi: monthlyGhi({ jun: 0, jul: 0, aug: 0 })
        }
      );

      expect(service.wattageNeeded(build)).toBe(0);
      expect(console.warn).toHaveBeenCalledWith(
        'Sun hours is zero or unavailable; cannot compute wattage needed.'
      );
    });
  });
});
