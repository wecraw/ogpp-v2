import { TestBed } from '@angular/core/testing';
import { ActivatedRoute, Router } from '@angular/router';
import { of } from 'rxjs';
import { Build, MonthlyGhi } from 'src/app/interfaces/Build';
import { Inverter } from 'src/app/interfaces/Inverter';
import { BuildService } from 'src/app/services/build.service';
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

  // A 3000 W load that runs for 1 hour: the 3000 W peak is covered by the DELTA
  // Pro (3600 W) but not the smaller Bluetti/Jackery stations, and the modest
  // storage/solar targets it implies stay within the DELTA Pro's caps. The
  // targets-aware anchor therefore lands on the DELTA Pro — the smallest
  // qualifying station that also meets the targets — so the pick is deterministic.
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

    expect(component.noAnchorInverter).toBeFalse();
    expect(component.build.inverter.id).toBe('ecoflow-delta-pro');
    expect(saveBuild).toHaveBeenCalled();
    expect(saveBuild.calls.mostRecent().args[0].inverter.id).toBe('ecoflow-delta-pro');
  });

  it('renders ranked vendor offers with a recommendation', () => {
    const fixture = TestBed.createComponent(ResultsComponent);
    fixture.detectChanges();
    const component = fixture.componentInstance;

    expect(component.offers.length).toBe(4);
    expect(component.recommendedOfferId).toBeTruthy();
    expect(
      component.offers.some(offer => offer.id === component.recommendedOfferId)
    ).toBeTrue();
  });

  it('Customize seeds the build from an offer and navigates to /build', () => {
    const fixture = TestBed.createComponent(ResultsComponent);
    fixture.detectChanges();
    const component = fixture.componentInstance;
    const offer = component.offers.find(item => item.id === 'ecoflow-delta-pro-complete')!;

    component.customize(offer);

    expect(component.build.bundleOfferId).toBe('ecoflow-delta-pro-complete');
    // The "complete" kit adds one extra battery and two 220W panels.
    expect(component.build.batteries.length).toBe(1);
    expect(component.build.powerSources.length).toBe(2);

    const savedBuild = saveBuild.calls.mostRecent().args[0];
    expect(savedBuild.bundleOfferId).toBe('ecoflow-delta-pro-complete');
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
