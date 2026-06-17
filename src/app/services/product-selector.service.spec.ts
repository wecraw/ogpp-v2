import { TestBed } from '@angular/core/testing';

import { ProductSelectorService } from './product-selector.service';
import { defaultBuild } from '../interfaces/Build';
import { inverters } from '../content/inverters';

describe('ProductSelectorService', () => {
  let service: ProductSelectorService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ProductSelectorService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('uses exact compatibility for the DELTA Pro instead of every EcoFlow battery', () => {
    const deltaPro = inverters.find(inverter => inverter.id === 'ecoflow-delta-pro')!;
    const matches = service.getMatchingBatteries({
      ...defaultBuild,
      inverter: deltaPro
    });

    expect(matches.map(battery => battery.id)).toEqual([
      'ecoflow-delta-pro-smart-battery'
    ]);
  });

  it('shows the full inverter catalog when no single unit meets the peak load', () => {
    const matches = service.getMatchingInverters({
      ...defaultBuild,
      appliances: [
        {
          id: 'oversized-load',
          name: 'Oversized Load',
          wattage: 6000,
          hours: 1,
          quantity: 1,
          applianceGroup: 'Test'
        }
      ]
    });

    expect(matches.length).toBe(inverters.length);
    expect(matches[0].maxOutput).toBe(4000);
  });
});
