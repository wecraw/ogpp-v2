import { TestBed } from '@angular/core/testing';
import { ActivatedRoute, Router } from '@angular/router';
import { of } from 'rxjs';
import { Build, MonthlyGhi } from 'src/app/interfaces/Build';
import { Inverter } from 'src/app/interfaces/Inverter';
import { BuildService } from 'src/app/services/build.service';
import { ProductDealsService } from 'src/app/services/product-deals.service';
import { ProductSelectorService } from 'src/app/services/product-selector.service';
import { ResultsComponent } from './results.component';

describe('ResultsComponent', () => {
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

  // A 3000 W load that runs for 1 hour: covered by several mid-size stations. Which
  // one the targets-aware anchor picks depends on the live catalog, so the tests
  // below derive the expected station and offers from the services rather than
  // pinning a product that a catalog refresh could displace.
  const build: Build = {
    name: 'Test build',
    id: 'build-1',
    appliances: [
      {
        id: 'space-heater',
        name: 'Space heater',
        wattage: 3000,
        hours: 1,
        quantity: 1,
        applianceGroup: 'Climate'
      }
    ],
    seasons: ['summer'],
    zipCode: '94107',
    monthlyGhi,
    powerSources: [],
    inverter: {} as Inverter,
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
      imports: [ResultsComponent],
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

  it('anchors and persists the recommended inverter on init', () => {
    const fixture = TestBed.createComponent(ResultsComponent);
    fixture.detectChanges();
    const component = fixture.componentInstance;

    const expected = TestBed.inject(ProductSelectorService).getAnchorInverter(
      component.build,
      component.batteryTarget,
      component.solarTarget
    );

    expect(component.noAnchorInverter).toBeFalse();
    expect(expected?.id).toBeTruthy();
    expect(component.build.inverter.id).toBe(expected!.id);
    expect(expected!.maxOutput).toBeGreaterThanOrEqual(3000);
    expect(saveBuild).toHaveBeenCalled();
    expect(saveBuild.calls.mostRecent().args[0].inverter.id).toBe(expected!.id);
  });

  it('renders ranked vendor offers with a recommendation', () => {
    const fixture = TestBed.createComponent(ResultsComponent);
    fixture.detectChanges();
    const component = fixture.componentInstance;

    // Curated vendor bundles for the anchor, or a synthesized kit when it has none.
    const anchorId = component.build.inverter.id!;
    const curated = TestBed.inject(ProductDealsService).getOffersForInverter(anchorId);
    expect(component.offers.map(offer => offer.id)).toEqual(
      curated.length ? curated.map(offer => offer.id) : [`auto-${anchorId}`]
    );
    expect(component.recommendedOfferId).toBeTruthy();
    expect(component.offers.some(offer => offer.id === component.recommendedOfferId)).toBeTrue();
  });

  it('Customize seeds the build from an offer and navigates to /build', () => {
    const fixture = TestBed.createComponent(ResultsComponent);
    fixture.detectChanges();
    const component = fixture.componentInstance;
    // Prefer a kit that adds both batteries and panels so both arrays are exercised.
    const offer =
      component.offers.find(
        item =>
          Object.keys(item.batteryQuantities).length > 0 &&
          Object.keys(item.powerSourceQuantities).length > 0
      ) ?? component.offers[0];
    const sum = (quantities: Record<string, number>) =>
      Object.values(quantities).reduce((total, quantity) => total + quantity, 0);

    component.customize(offer);

    expect(component.build.bundleOfferId).toBe(offer.id);
    // The build starts empty, so it holds exactly the kit's units.
    expect(component.build.batteries.length).toBe(sum(offer.batteryQuantities));
    expect(component.build.powerSources.length).toBe(sum(offer.powerSourceQuantities));

    const savedBuild = saveBuild.calls.mostRecent().args[0];
    expect(savedBuild.bundleOfferId).toBe(offer.id);
    expect(navigate).toHaveBeenCalledWith(['/build'], {
      queryParams: { buildId: 'build-1' }
    });
  });

  it('clears the stale inverter and offers no bundles when no station qualifies', () => {
    // A peak draw above every catalog station (e.g. a saved build edited up past
    // what any unit covers) while still carrying a previously-chosen inverter.
    const oversized: Build = {
      ...structuredClone(build),
      appliances: [
        {
          id: 'arc-welder',
          name: 'Arc welder',
          wattage: 99000,
          hours: 1,
          quantity: 1,
          applianceGroup: 'Tools'
        }
      ],
      inverter: { id: 'ecoflow-delta-pro' } as Inverter
    };

    TestBed.overrideProvider(BuildService, {
      useValue: { getBuild: () => structuredClone(oversized), saveBuild }
    });

    const fixture = TestBed.createComponent(ResultsComponent);
    fixture.detectChanges();
    const component = fixture.componentInstance;

    expect(component.noAnchorInverter).toBeTrue();
    expect(component.build.inverter.id).toBeUndefined();
    expect(component.offers.length).toBe(0);
    expect(component.recommendedOfferId).toBeUndefined();
  });
});
