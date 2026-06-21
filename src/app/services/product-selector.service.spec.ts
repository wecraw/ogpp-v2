import { TestBed } from '@angular/core/testing';

import { ProductSelectorService } from './product-selector.service';
import { defaultBuild } from '../interfaces/Build';
import { Inverter } from '../interfaces/Inverter';
import { batteries } from '../content/batteries';
import { inverters } from '../content/inverters';
import { solarPanels } from '../content/solarPanels';

describe('ProductSelectorService', () => {
  let service: ProductSelectorService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ProductSelectorService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('returns matching inverters from highest to lowest output', () => {
    const matches = service.getMatchingInverters({
      ...defaultBuild,
      appliances: [
        {
          id: 'well-pump',
          name: 'Well Pump',
          wattage: 3000,
          hours: 1,
          quantity: 1,
          applianceGroup: 'Water'
        }
      ]
    });

    expect(matches.map(inverter => inverter.id)).toEqual([
      'ecoflow-delta-pro-ultra',
      'ecoflow-delta-pro-3',
      'ecoflow-delta-pro'
    ]);
  });

  it('shows the full inverter catalog when there is no peak load yet', () => {
    const matches = service.getMatchingInverters(defaultBuild);

    expect(matches.map(inverter => inverter.id)).toEqual(sortedInverterIds());
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
    expect(matches.map(inverter => inverter.id)).toEqual(sortedInverterIds());
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

  it('steps up to the next station whose solar input clears the target', () => {
    const deltaPro = inverters.find(inverter => inverter.id === 'ecoflow-delta-pro')!;
    const stepUp = service.getStepUpInverter(
      { ...lightLoadBuild(), inverter: deltaPro },
      5000, // within DELTA Pro's 10,800 Wh max bank
      2000 // exceeds DELTA Pro's 1,600 W solar input
    );

    // DELTA Pro 3 (2,600 W solar) is the smallest larger sibling that fits.
    expect(stepUp?.id).toBe('ecoflow-delta-pro-3');
  });

  it('steps up to a station whose full battery bank clears the storage target', () => {
    const deltaPro = inverters.find(inverter => inverter.id === 'ecoflow-delta-pro')!;
    const stepUp = service.getStepUpInverter(
      { ...lightLoadBuild(), inverter: deltaPro },
      15000, // exceeds DELTA Pro (10,800) and DELTA Pro 3 (11,296) max banks
      1000
    );

    // Only the DELTA Pro Ultra (30,720 Wh max bank) can reach 15,000 Wh.
    expect(stepUp?.id).toBe('ecoflow-delta-pro-ultra');
  });

  it('returns undefined when the anchor already reaches both targets', () => {
    const deltaPro = inverters.find(inverter => inverter.id === 'ecoflow-delta-pro')!;
    const stepUp = service.getStepUpInverter(
      { ...lightLoadBuild(), inverter: deltaPro },
      5000,
      1000
    );

    expect(stepUp).toBeUndefined();
  });

  it('returns undefined when no larger same-brand station can reach the targets', () => {
    const deltaPro = inverters.find(inverter => inverter.id === 'ecoflow-delta-pro')!;
    const stepUp = service.getStepUpInverter(
      { ...lightLoadBuild(), inverter: deltaPro },
      50000, // beyond every EcoFlow station's max bank
      1000
    );

    expect(stepUp).toBeUndefined();
  });

  it('uses exact battery compatibility before brand matching', () => {
    const deltaPro = inverters.find(inverter => inverter.id === 'ecoflow-delta-pro')!;
    const matches = service.getMatchingBatteries({
      ...defaultBuild,
      inverter: deltaPro
    });

    expect(matches.map(battery => battery.id)).toEqual(['ecoflow-delta-pro-smart-battery']);
  });

  it('falls back to same-brand batteries when compatibility IDs are absent', () => {
    const bluetti = inverters.find(inverter => inverter.id === 'bluetti-ac200max')!;
    const matches = service.getMatchingBatteries({
      ...defaultBuild,
      inverter: bluetti
    });

    expect(matches.map(battery => battery.id)).toEqual(['bluetti-b230-expansion-battery']);
  });

  it('falls back to the full battery catalog when the brand has no matches', () => {
    const matches = service.getMatchingBatteries({
      ...defaultBuild,
      inverter: createInverter({ brand: 'Goal Zero' })
    });

    expect(matches).toEqual(batteries);
  });

  it('uses exact solar panel compatibility before brand matching', () => {
    const deltaPro = inverters.find(inverter => inverter.id === 'ecoflow-delta-pro')!;
    const matches = service.getMatchingSolarPanels({
      ...defaultBuild,
      inverter: deltaPro
    });

    expect(matches.map(panel => panel.id)).toEqual([
      'ecoflow-400w-portable-solar-panel',
      'ecoflow-220w-bifacial-panel',
      'ecoflow-100w-portable-panel'
    ]);
  });

  it('falls back to same-brand solar panels when compatibility IDs are absent', () => {
    const jackery = inverters.find(inverter => inverter.id === 'jackery-solar-generator-1000-v2')!;
    const matches = service.getMatchingSolarPanels({
      ...defaultBuild,
      inverter: jackery
    });

    expect(matches.map(panel => panel.id)).toEqual([
      'jackery-solarsaga-200w',
      'jackery-solarsaga-100w'
    ]);
  });

  it(
    'falls back to the full solar catalog when compatibility and brand matching find nothing',
    () => {
      const matches = service.getMatchingSolarPanels({
        ...defaultBuild,
        inverter: createInverter({
          brand: 'Goal Zero',
          compatiblePowerSourceIds: ['missing-panel']
        })
      });

      expect(matches).toEqual(solarPanels);
    }
  );
});

// A small load every EcoFlow station covers, so step-up choices turn purely on the
// battery/solar caps rather than the peak-output filter.
function lightLoadBuild() {
  return {
    ...defaultBuild,
    appliances: [
      {
        id: 'light-load',
        name: 'Light Load',
        wattage: 800,
        hours: 1,
        quantity: 1,
        applianceGroup: 'Test'
      }
    ]
  };
}

function sortedInverterIds(): (string | undefined)[] {
  return [...inverters]
    .sort((first, second) => second.maxOutput - first.maxOutput)
    .map(inverter => inverter.id);
}

function createInverter(overrides: Partial<Inverter>): Inverter {
  return {
    id: 'test-inverter',
    name: 'Test Inverter',
    brand: 'Test Brand',
    icon: 'bi-battery-charging',
    voltages: [120],
    maxSolarInput: 1000,
    maxTotalInput: 1000,
    maxOutput: 1000,
    price: 1000,
    ...overrides
  };
}
