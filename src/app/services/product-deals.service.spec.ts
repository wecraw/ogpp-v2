import { TestBed } from '@angular/core/testing';
import { ProductDealsService } from './product-deals.service';

describe('ProductDealsService', () => {
  let service: ProductDealsService;

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

  it('keeps an applied offer valid when extra products are added', () => {
    const offer = service
      .getOffersForInverter('ecoflow-delta-pro')
      .find(item => item.id === 'ecoflow-delta-pro-complete')!;

    expect(
      service.isOfferSatisfied(
        offer,
        { 'ecoflow-delta-pro-smart-battery': 2 },
        { 'ecoflow-220w-bifacial-panel': 3 }
      )
    ).toBeTrue();
  });
});
