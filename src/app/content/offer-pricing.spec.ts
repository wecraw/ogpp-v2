import { ProductBundleOfferSource } from 'src/app/interfaces/ProductBundleOffer';
import { CATALOG_FIXTURE } from 'src/testing/catalog-fixture';
import { alaCarteCost, resolveBundleOffer } from './offer-pricing';

describe('offer pricing', () => {
  const catalogs = CATALOG_FIXTURE;
  const deltaPro = catalogs.inverters.find(item => item.id === 'ecoflow-delta-pro')!;

  function source(overrides: Partial<ProductBundleOfferSource>): ProductBundleOfferSource {
    return {
      id: 'test-offer',
      inverterId: 'ecoflow-delta-pro',
      name: 'Test',
      description: '',
      highlights: [],
      packagePrice: 2399,
      compareAtPrice: 3289,
      batteryQuantities: {},
      powerSourceQuantities: { 'ecoflow-220w-bifacial-panel': 2 },
      vendor: 'EcoFlow',
      vendorUrl: 'https://example.com',
      verifiedOn: '2026-09-23',
      ...overrides
    };
  }

  it('sums the parts and flags whether all of them can be bought today', () => {
    const inStock = alaCarteCost(catalogs, deltaPro, {}, { 'ecoflow-220w-bifacial-panel': 2 });
    expect(inStock).toEqual({ price: 2697, compareAtPrice: 3597, purchasable: true });

    const withSoldOut = alaCarteCost(
      catalogs,
      deltaPro,
      { 'ecoflow-delta-pro-smart-battery': 1 },
      {}
    );
    expect(withSoldOut.purchasable).toBeFalse();
  });

  it('quotes the preset package when it beats the parts', () => {
    // 1899 + 2 × 399 = 2697 à la carte vs a 2399 package.
    const offer = resolveBundleOffer(source({}), catalogs);

    expect(offer.price).toBe(2399);
    expect(offer.presetPrice).toBeUndefined();
    expect(offer.optimizationNote).toBe(
      'EcoFlow’s preset package is $298 less than buying the parts separately.'
    );
    expect('packagePrice' in offer).toBeFalse();
  });

  it('quotes the parts and keeps the preset price when the parts are cheaper', () => {
    const offer = resolveBundleOffer(
      source({ packagePrice: 2999, compareAtPrice: 3500 }),
      catalogs
    );

    expect(offer.price).toBe(2697);
    expect(offer.presetPrice).toBe(2999);
    expect(offer.optimizationNote).toBe(
      'Buying the parts separately is $302 less than EcoFlow’s preset package.'
    );
  });

  it('never quotes a parts price that includes a sold-out part', () => {
    // 1899 + 1199 = 3098 would beat a 3200 package, but the battery is sold out.
    const offer = resolveBundleOffer(
      source({
        packagePrice: 3200,
        compareAtPrice: 4809,
        batteryQuantities: { 'ecoflow-delta-pro-smart-battery': 1 },
        powerSourceQuantities: {}
      }),
      catalogs
    );

    expect(offer.price).toBe(3200);
    expect(offer.presetPrice).toBeUndefined();
    expect(offer.optimizationNote).toContain('aren’t sold separately right now');
  });

  it('adds no note when the package and the parts cost the same', () => {
    const offer = resolveBundleOffer(source({ packagePrice: 2697 }), catalogs);

    expect(offer.price).toBe(2697);
    expect(offer.optimizationNote).toBeUndefined();
  });
});
