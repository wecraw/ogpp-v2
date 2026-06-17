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
          wattage: 8000,
          hours: 1,
          quantity: 1,
          applianceGroup: 'Test'
        }
      ]
    });

    expect(matches.length).toBe(inverters.length);
    // Catalog is sorted descending by maxOutput; the DELTA Pro Ultra leads at 7200W.
    expect(matches[0].maxOutput).toBe(7200);
  });

  it('anchors on the smallest station that still covers the peak load', () => {
    const anchor = service.getAnchorInverter({
      ...defaultBuild,
      appliances: [
        {
          id: 'mid-load',
          name: 'Mid Load',
          wattage: 2000,
          hours: 1,
          quantity: 1,
          applianceGroup: 'Test'
        }
      ]
    });

    // Qualifying maxOutputs >= 2000 are 3600, 4000, 7200 and 2200; the best fit
    // is the 2200W Bluetti AC200MAX, not the over-sized DELTA Pro Ultra.
    expect(anchor?.maxOutput).toBe(2200);
    expect(anchor?.name).toBe('AC200MAX');
  });

  it('returns undefined when no single station can cover the peak load', () => {
    const anchor = service.getAnchorInverter({
      ...defaultBuild,
      appliances: [
        {
          id: 'oversized-load',
          name: 'Oversized Load',
          wattage: 8000,
          hours: 1,
          quantity: 1,
          applianceGroup: 'Test'
        }
      ]
    });

    expect(anchor).toBeUndefined();
  });
});
