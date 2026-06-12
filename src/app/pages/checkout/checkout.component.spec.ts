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

  it('preserves existing panels when applying a bundle', () => {
    const fixture = TestBed.createComponent(CheckoutComponent);
    fixture.detectChanges();
    const component = fixture.componentInstance;
    const offer = component.offers.find(item => item.id === 'ecoflow-delta-pro-complete')!;

    component.applyBundle(offer);

    expect(component.solarWattage).toBe(840);
    expect(component.build.batteries.length).toBe(1);
    expect(component.totalPrice).toBe(3665);
    expect(saveBuild).toHaveBeenCalled();
  });
});
