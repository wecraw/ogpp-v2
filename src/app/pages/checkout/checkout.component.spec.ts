import { TestBed } from '@angular/core/testing';
import { ActivatedRoute, Router } from '@angular/router';
import { of } from 'rxjs';
import { inverters } from 'src/app/content/inverters';
import { solarPanels } from 'src/app/content/solarPanels';
import { Build, MonthlyGhi } from 'src/app/interfaces/Build';
import { BuildService } from 'src/app/services/build.service';
import { CheckoutComponent } from './checkout.component';

describe('CheckoutComponent', () => {
  const monthlyGhi: MonthlyGhi = {
    jan: 5,
    feb: 5,
    mar: 5,
    apr: 5,
    may: 5,
    jun: 5,
    jul: 5,
    aug: 5,
    sep: 5,
    oct: 5,
    nov: 5,
    dec: 5
  };
  const deltaPro = inverters.find(inverter => inverter.id === 'ecoflow-delta-pro')!;
  const fourHundredWattPanel = solarPanels.find(
    panel => panel.id === 'ecoflow-400w-portable-solar-panel'
  )!;
  const build: Build = {
    name: 'Test build',
    id: 'build-1',
    appliances: [
      {
        id: 'fridge',
        name: 'Fridge',
        wattage: 300,
        hours: 4,
        quantity: 1,
        applianceGroup: 'Kitchen'
      }
    ],
    seasons: ['summer'],
    zipCode: '94107',
    monthlyGhi,
    powerSources: [fourHundredWattPanel],
    inverter: deltaPro,
    batteries: [],
    createdOn: new Date(),
    lastEdited: new Date()
  };
  const saveBuild = jasmine.createSpy('saveBuild');
  const navigate = jasmine.createSpy('navigate');

  beforeEach(async () => {
    saveBuild.calls.reset();
    navigate.calls.reset();

    await TestBed.configureTestingModule({
      imports: [CheckoutComponent],
      providers: [
        {
          provide: ActivatedRoute,
          useValue: { queryParams: of({ buildId: build.id }) }
        },
        {
          provide: Router,
          useValue: { navigate }
        },
        {
          provide: BuildService,
          useValue: {
            getBuild: () => structuredClone(build),
            saveBuild
          }
        }
      ]
    }).compileComponents();
  });

  it('loads vendor offers for the selected station', () => {
    const fixture = TestBed.createComponent(CheckoutComponent);
    fixture.detectChanges();

    expect(fixture.componentInstance.offers.length).toBe(4);
  });

  it('prices an exact bundle match at the bundle price only', () => {
    // A build whose gear matches a fixed-SKU bundle exactly should show the
    // bundle price (and its compare-at), never a mixed total.
    TestBed.overrideProvider(BuildService, {
      useValue: {
        getBuild: () =>
          structuredClone({ ...build, powerSources: [], batteries: [] }),
        saveBuild
      }
    });
    const fixture = TestBed.createComponent(CheckoutComponent);
    fixture.detectChanges();
    const component = fixture.componentInstance;
    const offer = component.offers.find(item => item.id === 'ecoflow-delta-pro-2x220w')!;

    component.applyBundle(offer);

    expect(component.activeBundleOffer?.id).toBe('ecoflow-delta-pro-2x220w');
    expect(component.totalPrice).toBe(offer.price);
    expect(component.compareAtTotal).toBe(offer.compareAtPrice);
  });

  it('falls back to à-la-carte pricing when the build deviates from a bundle', () => {
    // The build already holds a 400W panel, so applying the complete bundle
    // (which has no 400W panel) is no longer an exact match. Pricing must be the
    // pure à-la-carte sum with no bundle active and no mixed totals.
    const fixture = TestBed.createComponent(CheckoutComponent);
    fixture.detectChanges();
    const component = fixture.componentInstance;
    const offer = component.offers.find(item => item.id === 'ecoflow-delta-pro-complete')!;

    component.applyBundle(offer);

    expect(component.solarWattage).toBe(840);
    expect(component.build.batteries.length).toBe(1);
    expect(component.activeBundleOffer).toBeUndefined();
    // 1699 station + 999 battery + 469 (400W) + 2 × 249 (220W) = 3665 à la carte.
    expect(component.totalPrice).toBe(3665);
    expect(saveBuild).toHaveBeenCalled();
  });
});
