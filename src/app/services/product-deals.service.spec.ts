import { TestBed } from '@angular/core/testing';
import { ProductDealsService } from './product-deals.service';
import { Build, defaultBuild } from '../interfaces/Build';
import { CATALOG_FIXTURE, provideCatalogFixture } from 'src/testing/catalog-fixture';

const { inverters, batteries, solarPanels } = CATALOG_FIXTURE;

describe('ProductDealsService', () => {
  let service: ProductDealsService;
  const deltaPro = inverters.find(inverter => inverter.id === 'ecoflow-delta-pro')!;

  beforeEach(() => {
    TestBed.configureTestingModule({ providers: [provideCatalogFixture()] });
    service = TestBed.inject(ProductDealsService);
  });

  it('returns the current DELTA Pro offers', () => {
    const offers = service.getOffersForInverter('ecoflow-delta-pro');

    expect(offers.length).toBe(4);
    expect(offers.map(offer => offer.id)).toContain('ecoflow-delta-pro-complete');
  });

  it('leaves out bundles the vendor has sold out of', () => {
    // The fixture's only DELTA Pro 3 bundle is out of stock.
    expect(service.getOffersForInverter('ecoflow-delta-pro-3')).toEqual([]);
  });

  it('builds auto-kits from in-stock parts when any exist', () => {
    // The out-of-stock DELTA Pro battery is the larger option, but the kit should
    // use the in-stock B300K rather than a part nobody can order.
    const soldOut = batteries.find(item => item.id === 'ecoflow-delta-pro-smart-battery')!;
    const inStock = batteries.find(item => item.id === 'bluetti-b300k-expansion-battery')!;

    const kit = service.buildAutoKit(deltaPro, 8000, 0, [soldOut, inStock], []);

    expect(Object.keys(kit!.batteryQuantities)).toEqual(['bluetti-b300k-expansion-battery']);
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

  it('uses discounted add-ons when they beat a vendor preset package price', () => {
    const offer = service
      .getOffersForInverter('bluetti-apex-300')
      .find(item => item.id === 'bluetti-apex-300-complete')!;

    // 1499 station + 1099 B300K + 2 × 399 panels beats Bluetti's 3499 preset.
    expect(offer.price).toBe(3396);
    expect(offer.presetPrice).toBe(3499);
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

    // 1899 station + 1199 battery + 2 × 399 panels
    expect(cost.price).toBe(3896);
    // 2799 + 1999 list prices + 2 × 399 (the 220W panel has no list price, so its
    // price stands in)
    expect(cost.compareAtPrice).toBe(5596);
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

    // 1899 station + 2 × 399 panels = 2697 à la carte vs the 2399 bundle price.
    expect(offer.alaCartePrice).toBe(2697);
    expect(offer.savingsVsAlaCarte).toBe(298);
  });

  it('recommends a same-gear bundle that beats the à-la-carte price', () => {
    const offers = service.getOffersForInverter('ecoflow-delta-pro');
    // DELTA Pro (3600 Wh built-in) + 2×220W panels built by hand costs 2697 à la
    // carte; the matching bundle is 2399 — a free $298 for identical coverage.
    const better = service.getBetterBundle(offers, 3600, 440, 2697);

    expect(better?.id).toBe('ecoflow-delta-pro-2x220w');
  });

  it('returns no better bundle when the current build is already the cheapest coverage', () => {
    const offers = service.getOffersForInverter('ecoflow-delta-pro');
    // A bare DELTA Pro (1899) is cheaper than every bundle, so none is an upgrade
    // at or below the current price.
    expect(service.getBetterBundle(offers, 3600, 0, 1899)).toBeUndefined();
  });

  it('excludes the already-active offer from better-bundle suggestions', () => {
    const offers = service.getOffersForInverter('ecoflow-delta-pro');
    expect(
      service.getBetterBundle(offers, 3600, 440, 2399, 'ecoflow-delta-pro-2x220w')
    ).toBeUndefined();
  });

  it('replaces the build’s gear with exactly the offer SKU in replace mode', () => {
    const offer = service
      .getOffersForInverter('ecoflow-delta-pro')
      .find(item => item.id === 'ecoflow-delta-pro-2x220w')!;
    const smartBattery = batteries.find(item => item.id === 'ecoflow-delta-pro-smart-battery')!;
    const build: Build = {
      ...defaultBuild,
      inverter: deltaPro,
      batteries: [smartBattery, smartBattery],
      powerSources: []
    };

    service.applyOfferToBuild(build, offer, batteries, solarPanels, 'replace');

    // Replace drops the user's extra batteries and lands exactly on the SKU.
    expect(build.batteries.length).toBe(0);
    expect(build.powerSources.length).toBe(2);
    expect(build.bundleOfferId).toBe('ecoflow-delta-pro-2x220w');
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
    expect(
      build.powerSources.every(panel => panel.id === 'ecoflow-220w-bifacial-panel')
    ).toBeTrue();
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
