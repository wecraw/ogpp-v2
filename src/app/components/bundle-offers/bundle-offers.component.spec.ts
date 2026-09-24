import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BundleOffersComponent } from './bundle-offers.component';
import { Inverter } from 'src/app/interfaces/Inverter';
import { ProductBundleOfferView } from 'src/app/interfaces/ProductBundleOffer';
import { AffiliateLinkService } from 'src/app/services/affiliate-link.service';

function makeOffer(overrides: Partial<ProductBundleOfferView>): ProductBundleOfferView {
  return {
    id: 'offer',
    inverterId: 'ecoflow-delta-pro',
    name: 'Offer',
    description: '',
    highlights: [],
    price: 2000,
    compareAtPrice: 2500,
    batteryQuantities: {},
    powerSourceQuantities: {},
    vendor: 'EcoFlow',
    vendorUrl: 'https://example.com/bundle',
    verifiedOn: '2026-06-12',
    batteryCapacity: 3600,
    solarWattage: 400,
    alaCartePrice: 2200,
    savingsVsAlaCarte: 200,
    ...overrides
  };
}

describe('BundleOffersComponent', () => {
  let component: BundleOffersComponent;
  let fixture: ComponentFixture<BundleOffersComponent>;
  let affiliateLink: jasmine.SpyObj<AffiliateLinkService>;

  const offers = [
    makeOffer({ id: 'small', name: 'Small bundle' }),
    makeOffer({ id: 'large', name: 'Large bundle', price: 3000, compareAtPrice: 4200 })
  ];

  beforeEach(() => {
    affiliateLink = jasmine.createSpyObj<AffiliateLinkService>('AffiliateLinkService', [
      'decorate'
    ]);
    affiliateLink.decorate.and.callFake(url => `${url}?ref=test`);

    TestBed.configureTestingModule({
      imports: [BundleOffersComponent],
      providers: [{ provide: AffiliateLinkService, useValue: affiliateLink }]
    });
    fixture = TestBed.createComponent(BundleOffersComponent);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('offers', offers);
  });

  function cards(): HTMLElement[] {
    return Array.from(fixture.nativeElement.querySelectorAll('.offer-card'));
  }

  it('renders one card per offer', () => {
    fixture.detectChanges();
    expect(cards().length).toBe(2);
    expect(cards()[1].textContent).toContain('Large bundle');
  });

  it('names the anchor station in the heading, with a generic fallback', () => {
    expect(component.bundleHeading).toBe('Recommended bundles');

    fixture.componentRef.setInput('anchorInverter', {
      brand: 'EcoFlow',
      name: 'DELTA Pro'
    } as Inverter);

    expect(component.bundleHeading).toBe('EcoFlow DELTA Pro bundles');
  });

  it('shows the oldest offer verification date as the prices-checked note', () => {
    fixture.componentRef.setInput('offers', [
      makeOffer({ id: 'fresh', verifiedOn: '2026-09-23' }),
      makeOffer({ id: 'stale', verifiedOn: '2026-06-12' })
    ]);
    fixture.detectChanges();

    const note = fixture.nativeElement.querySelector('.verified') as HTMLElement;
    expect(note.textContent).toContain('Prices checked June 12, 2026');
  });

  it('hides the prices-checked note when no offer carries a date', () => {
    fixture.componentRef.setInput('offers', [makeOffer({ verifiedOn: '' })]);
    fixture.detectChanges();

    expect(fixture.nativeElement.querySelector('.verified')).toBeNull();
  });

  it('computes savings against the compare-at price', () => {
    expect(component.savings(offers[1])).toBe(1200);
  });

  it('decorates vendor links with affiliate params', () => {
    fixture.detectChanges();

    const link = cards()[0].querySelector('a.vendor-link') as HTMLAnchorElement;

    expect(affiliateLink.decorate).toHaveBeenCalledWith('https://example.com/bundle', 'EcoFlow');
    expect(link.getAttribute('href')).toBe('https://example.com/bundle?ref=test');
  });

  it('badges the recommended offer', () => {
    fixture.componentRef.setInput('recommendedOfferId', 'large');
    fixture.detectChanges();

    expect(cards()[1].classList).toContain('recommended');
    expect(cards()[1].textContent).toContain('Best fit for this build');
    expect(cards()[0].classList).not.toContain('recommended');
  });

  it('emits the offer when applied', () => {
    const applied: ProductBundleOfferView[] = [];
    component.applyOffer.subscribe(offer => applied.push(offer));
    fixture.detectChanges();

    (cards()[0].querySelector('.apply-button') as HTMLButtonElement).click();

    expect(applied).toEqual([offers[0]]);
  });

  it('disables and relabels the button for the active offer', () => {
    fixture.componentRef.setInput('activeOfferId', 'small');
    fixture.componentRef.setInput('appliedLabel', 'In use');
    fixture.detectChanges();

    const active = cards()[0].querySelector('.apply-button') as HTMLButtonElement;
    const other = cards()[1].querySelector('.apply-button') as HTMLButtonElement;

    expect(active.disabled).toBeTrue();
    expect(active.textContent?.trim()).toBe('In use');
    expect(other.disabled).toBeFalse();
    expect(other.textContent?.trim()).toBe('Use this bundle');
  });
});
