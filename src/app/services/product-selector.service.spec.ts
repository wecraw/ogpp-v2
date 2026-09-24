import { TestBed } from '@angular/core/testing';

import { ProductSelectorService } from './product-selector.service';
import { defaultBuild } from '../interfaces/Build';
import { Inverter } from '../interfaces/Inverter';
import { isPurchasable } from '../interfaces/Availability';
import { CATALOG_FIXTURE, provideCatalogFixture } from 'src/testing/catalog-fixture';

const { inverters, batteries, solarPanels } = CATALOG_FIXTURE;
const purchasableInverters = inverters.filter(inverter => isPurchasable(inverter.availability));

describe('ProductSelectorService', () => {
  let service: ProductSelectorService;

  beforeEach(() => {
    TestBed.configureTestingModule({ providers: [provideCatalogFixture()] });
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

    // Derived from the catalog so adding stations can't make this brittle: every
    // unit clearing the 3000 W peak, highest output first.
    const expected = [...inverters]
      .filter(inverter => inverter.maxOutput >= 3000)
      .sort((first, second) => second.maxOutput - first.maxOutput)
      .map(inverter => inverter.id);
    expect(expected.length).toBeGreaterThan(1);
    expect(matches.map(inverter => inverter.id)).toEqual(expected);
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

    // The anchor is the smallest purchasable station that still covers the 2000 W
    // peak (the out-of-stock AC200MAX is skipped).
    const smallestQualifyingOutput = Math.min(
      ...purchasableInverters
        .filter(inverter => inverter.maxOutput >= 2000)
        .map(inverter => inverter.maxOutput)
    );
    expect(anchor?.maxOutput).toBe(smallestQualifyingOutput);
  });

  it('anchors on the smallest station that also reaches the storage/solar targets', () => {
    // A peak the small Jackery 1000 v2 (400 W solar) covers, but with a solar target
    // that exceeds its input — the engine should reach past it to the smallest station
    // whose caps fit, instead of anchoring on it and prompting a step-up.
    const peak = 1400;
    const solarTarget = 600;
    const build = {
      ...defaultBuild,
      appliances: [
        {
          id: 'mid-load',
          name: 'Mid Load',
          wattage: peak,
          hours: 1,
          quantity: 1,
          applianceGroup: 'Test'
        }
      ]
    };

    const anchor = service.getAnchorInverter(build, 0, solarTarget);

    // Derived from the catalog: the smallest peak-covering station whose solar input
    // also clears the target (storage target 0 keeps storage out of the comparison).
    const expectedOutput = Math.min(
      ...purchasableInverters
        .filter(inverter => inverter.maxOutput >= peak && inverter.maxSolarInput >= solarTarget)
        .map(inverter => inverter.maxOutput)
    );
    expect(anchor?.maxSolarInput).toBeGreaterThanOrEqual(solarTarget);
    expect(anchor?.maxOutput).toBe(expectedOutput);
    // It really moved past the peak-only pick.
    expect(anchor?.maxOutput).not.toBe(service.getAnchorInverter(build)?.maxOutput);
  });

  it('falls back to the smallest peak-covering station when no unit reaches the targets', () => {
    const build = lightLoadBuild();
    const targeted = service.getAnchorInverter(build, 999999, 999999);

    expect(targeted?.id).toBe(service.getAnchorInverter(build)?.id);
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

  it('never anchors on a discontinued or sold-out station when a purchasable one fits', () => {
    // 1,600 W is covered first by the discontinued DELTA 2 (1,800 W) and the
    // out-of-stock AC200MAX (2,200 W); the anchor must skip both.
    const anchor = service.getAnchorInverter({
      ...defaultBuild,
      appliances: [
        {
          id: 'mid-load',
          name: 'Mid Load',
          wattage: 1600,
          hours: 1,
          quantity: 1,
          applianceGroup: 'Test'
        }
      ]
    });

    expect(anchor?.id).toBe('ecoflow-delta-pro');
  });

  it('never steps up to a sold-out sibling', () => {
    // The out-of-stock AC200MAX would be the smallest larger Bluetti that clears a
    // 800 W solar target; the step-up must go to the Apex 300 instead.
    const smallBluetti = createInverter({
      id: 'bluetti-small',
      brand: 'Bluetti',
      maxOutput: 1000,
      maxSolarInput: 100
    });
    const stepUp = service.getStepUpInverter(
      { ...lightLoadBuild(), inverter: smallBluetti },
      0,
      800
    );

    expect(stepUp?.id).toBe('bluetti-apex-300');
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
      15000, // exceeds DELTA Pro (10,800) and DELTA Pro 3 (12,288) max banks
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
    // Every catalog station pins explicit IDs, so a synthetic Jackery unit exercises
    // the brand-match path.
    const matches = service.getMatchingBatteries({
      ...defaultBuild,
      inverter: createInverter({ brand: 'Jackery', maxBatteries: 2 })
    });

    expect(matches.map(battery => battery.id)).toEqual(
      batteries.filter(battery => battery.brand === 'Jackery').map(battery => battery.id)
    );
  });

  it('offers no batteries for a station without an expansion port', () => {
    // The Explorer 1000 v2 takes no expansion batteries; it must not fall back to
    // listing same-brand packs it can never accept.
    const jackery = inverters.find(inverter => inverter.id === 'jackery-solar-generator-1000-v2')!;
    expect(jackery.maxBatteries).toBe(0);

    const matches = service.getMatchingBatteries({ ...defaultBuild, inverter: jackery });

    expect(matches).toEqual([]);
  });

  it('falls back to the full battery catalog when the brand has no matches', () => {
    const matches = service.getMatchingBatteries({
      ...defaultBuild,
      inverter: createInverter({ brand: 'No Such Brand' })
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
    const matches = service.getMatchingSolarPanels({
      ...defaultBuild,
      inverter: createInverter({ brand: 'Jackery' })
    });

    expect(matches.map(panel => panel.id)).toEqual(
      solarPanels.filter(panel => panel.brand === 'Jackery').map(panel => panel.id)
    );
  });

  it('falls back to the full solar catalog when compatibility and brand matching find nothing', () => {
    const matches = service.getMatchingSolarPanels({
      ...defaultBuild,
      inverter: createInverter({
        brand: 'No Such Brand',
        compatiblePowerSourceIds: ['missing-panel']
      })
    });

    expect(matches).toEqual(solarPanels);
  });
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
