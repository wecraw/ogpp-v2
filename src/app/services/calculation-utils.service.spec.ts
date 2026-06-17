import { TestBed } from '@angular/core/testing';

import { CalculationUtilsService } from './calculation-utils.service';
import { Build } from '../interfaces/Build';
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

  const buildWith = (appliances: Appliance[]): Build =>
    ({ appliances } as unknown as Build);

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
      const build = buildWith([appliance({ wattage: 1500, quantity: 3, usageType: 'intermittent' })]);
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
});
