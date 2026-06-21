import { TestBed } from '@angular/core/testing';
import { ProductDealsService } from './product-deals.service';
import { batteries } from '../content/batteries';
import { inverters } from '../content/inverters';
import { solarPanels } from '../content/solarPanels';
import { Build, defaultBuild } from '../interfaces/Build';

describe('ProductDealsService', () => {
  let service: ProductDealsService;
  const deltaPro = inverters.find(inverter => inverter.id === 'ecoflow-delta-pro')!;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ProductDealsService);
  });

  it('returns the current DELTA Pro offers', () => {
    const offers = service.getOffersForInverter('ecoflow-delta-pro');

    expect(offers.length).toBe(4);
    expect(offers.map(offer => offer.id)).toContain('ecoflow-delta-pro-complete');
  });

  it('recommends the lowest-price bundle that meets the build targets', () => {
    const offers = service.getOffersForInverter('ecoflow-delta-pro');
    const recommendation = service.getRecommendedOffer(offers, 3000, 420);

    expect(recommendation?.id).toBe('ecoflow-delta-pro-2x220w');
  });

  it('recommends the complete bundle when extra storage is required', () => {
    const offers = service.getOffersForInverter('ecoflow-delta-pro');
    const recommendation = service.getRecommendedOffer(offers, 6000, 400);

    expect(recommendation?.id).toBe('ecoflow-delta-pro-complete');
  });

  it('uses discounted add-ons when they beat EcoFlow preset package pricing', () => {
    const offer = service
      .getOffersForInverter('ecoflow-delta-pro')
      .find(item => item.id === 'ecoflow-delta-pro-complete')!;

    expect(offer.price).toBe(3196);
    expect(offer.presetPrice).toBe(3498);
  });

  it('treats a bundle as active only when quantities match exactly', () => {
    const offer = service
      .getOffersForInverter('ecoflow-delta-pro')
      .find(item => item.id === 'ecoflow-delta-pro-complete')!;

    expect(
      service.isOfferExact(
        offer,
        { 'ecoflow-delta-pro-smart-battery': 1 },
        { 'ecoflow-220w-bifacial-panel': 2 }
      )
    ).toBeTrue();
  });

  it('falls back from a bundle when any quantity deviates', () => {
    const offer = service
      .getOffersForInverter('ecoflow-delta-pro')
      .find(item => item.id === 'ecoflow-delta-pro-complete')!;

    // One extra battery beyond the fixed SKU — no longer the bundle.
    expect(
      service.isOfferExact(
        offer,
        { 'ecoflow-delta-pro-smart-battery': 2 },
        { 'ecoflow-220w-bifacial-panel': 2 }
      )
    ).toBeFalse();

    // A panel the bundle does not include.
    expect(
      service.isOfferExact(
        offer,
        { 'ecoflow-delta-pro-smart-battery': 1 },
        { 'ecoflow-220w-bifacial-panel': 2, 'ecoflow-400w-portable-solar-panel': 1 }
      )
    ).toBeFalse();

    // A missing required panel.
    expect(
      service.isOfferExact(
        offer,
        { 'ecoflow-delta-pro-smart-battery': 1 },
        { 'ecoflow-220w-bifacial-panel': 1 }
      )
    ).toBeFalse();
  });

  it('sums à-la-carte price and compare-at price across station and components', () => {
    const cost = service.alaCarteCost(
      deltaPro,
      { 'ecoflow-delta-pro-smart-battery': 1 },
      { 'ecoflow-220w-bifacial-panel': 2 }
    );

    // 1699 station + 999 battery + 2 × 249 panels
    expect(cost.price).toBe(3196);
    // 3699 + 2799 + 2 × 649 list prices
    expect(cost.compareAtPrice).toBe(7796);
  });

  it('ignores unknown ids and non-positive quantities in à-la-carte sums', () => {
    const cost = service.alaCarteCost(
      deltaPro,
      { 'not-a-real-battery': 5, 'ecoflow-delta-pro-smart-battery': 0 },
      {}
    );

    expect(cost.price).toBe(deltaPro.price);
  });

  it('exposes à-la-carte price and savings on each offer view', () => {
    const offer = service
      .getOffersForInverter('ecoflow-delta-pro')
      .find(item => item.id === 'ecoflow-delta-pro-2x220w')!;

    // 1699 station + 2 × 249 panels = 2197 à la carte vs the 2149 bundle price.
    expect(offer.alaCartePrice).toBe(2197);
    expect(offer.savingsVsAlaCarte).toBe(48);
  });

  it('pre-seeds a build with an offer’s required gear via applyOfferToBuild', () => {
    const offer = service
      .getOffersForInverter('ecoflow-delta-pro')
      .find(item => item.id === 'ecoflow-delta-pro-complete')!;
    const build: Build = {
      ...defaultBuild,
      inverter: deltaPro,
      batteries: [],
      powerSources: []
    };

    service.applyOfferToBuild(build, offer, batteries, solarPanels);

    expect(build.bundleOfferId).toBe('ecoflow-delta-pro-complete');
    expect(build.batteries.length).toBe(1);
    expect(build.batteries[0].id).toBe('ecoflow-delta-pro-smart-battery');
    expect(build.powerSources.length).toBe(2);
    expect(build.powerSources.every(panel => panel.id === 'ecoflow-220w-bifacial-panel')).toBeTrue();
  });

  it('never reduces quantities the user already chose when applying an offer', () => {
    const offer = service
      .getOffersForInverter('ecoflow-delta-pro')
      .find(item => item.id === 'ecoflow-delta-pro-complete')!;
    const smartBattery = batteries.find(item => item.id === 'ecoflow-delta-pro-smart-battery')!;
    const build: Build = {
      ...defaultBuild,
      inverter: deltaPro,
      batteries: [smartBattery, smartBattery],
      powerSources: []
    };

    service.applyOfferToBuild(build, offer, batteries, solarPanels);

    // Offer requires 1 battery, build already had 2 — keep the larger.
    expect(build.batteries.length).toBe(2);
  });
});
