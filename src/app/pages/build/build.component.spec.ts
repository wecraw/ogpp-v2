import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute, Router } from '@angular/router';
import { of } from 'rxjs';
import { inverters } from 'src/app/content/inverters';
import { Build, defaultBuild, MonthlyGhi } from 'src/app/interfaces/Build';
import { BuildService } from 'src/app/services/build.service';

import { BuildComponent } from './build.component';

describe('BuildComponent', () => {
  it('marks the page as not found when the query build does not exist', async () => {
    const { component, fixture } = await setup(null);

    fixture.detectChanges();

    expect(component.buildNotFound).toBeTrue();
  });

  it('loads a saved build and derives recommendation targets', async () => {
    const build = createBuild();
    const { component, fixture } = await setup(build);

    fixture.detectChanges();

    expect(component.buildNotFound).toBeFalse();
    expect(component.peakWattage).toBe(2200);
    expect(component.totalWattHours).toBe(4200);
    expect(component.worstSeasonSunHours).toBe(5);
    expect(component.wattageNeeded).toBe(840);
    // Every station clearing the 2200 W peak, highest output first — derived from
    // the catalog so adding stations doesn't make this assertion brittle.
    const expectedInverterIds = [...inverters]
      .filter(inverter => inverter.maxOutput >= 2200)
      .sort((first, second) => second.maxOutput - first.maxOutput)
      .map(inverter => inverter.id);
    expect(expectedInverterIds.length).toBeGreaterThan(1);
    expect(component.inverters.map(inverter => inverter.id)).toEqual(expectedInverterIds);
  });

  it('caps battery quantity to the bank total across models', async () => {
    const { component, fixture } = await setup(createBuild());

    fixture.detectChanges();

    // DELTA Pro accepts a 2-battery bank. From a cold start the whole bank is open.
    const battery = component.batteries[0];
    expect(component.remainingBatterySlots).toBe(2);
    expect(component.getBatteryMaxQuantity(battery)).toBe(2);

    // The cap is a bank total, not per-model: two slots filled (even across models)
    // leave no room, so a model already holding one can't be raised.
    component.batteryQuantities = { [battery.id!]: 1, 'another-model': 1 };
    expect(component.totalBatteryQuantity).toBe(2);
    expect(component.remainingBatterySlots).toBe(0);
    expect(component.getBatteryMaxQuantity(battery)).toBe(1);
  });

  it('caps solar quantity to the station maxSolarInput headroom', async () => {
    const { component, fixture } = await setup(createBuild());

    fixture.detectChanges();

    // DELTA Pro accepts 1,600 W of solar; a 400 W panel fits four times from empty.
    const panel = component.solarPanels.find(item => item.maxOutput === 400)!;
    expect(component.getSolarMaxQuantity(panel)).toBe(4);

    // Three panels (1,200 W) leave 400 W of headroom — exactly one more 400 W panel.
    component.onSolarQuantityChange(panel, 3);
    expect(component.selectedSolarWattage).toBe(1200);
    expect(component.remainingSolarInput).toBe(400);
    expect(component.getSolarMaxQuantity(panel)).toBe(4);
  });
});

async function setup(savedBuild: Build | null): Promise<{
  component: BuildComponent;
  fixture: ComponentFixture<BuildComponent>;
  buildService: jasmine.SpyObj<BuildService>;
  router: jasmine.SpyObj<Router>;
}> {
  const buildService = jasmine.createSpyObj<BuildService>('BuildService', [
    'getBuild',
    'saveBuild'
  ]);
  const router = jasmine.createSpyObj<Router>('Router', ['navigate']);
  buildService.getBuild.and.returnValue(savedBuild);

  await TestBed.configureTestingModule({
    imports: [BuildComponent],
    providers: [
      {
        provide: ActivatedRoute,
        useValue: { queryParams: of({ buildId: 'build-1' }) }
      },
      { provide: Router, useValue: router },
      { provide: BuildService, useValue: buildService }
    ]
  }).compileComponents();

  const fixture = TestBed.createComponent(BuildComponent);
  const component = fixture.componentInstance;
  return { component, fixture, buildService, router };
}

function createBuild(): Build {
  const monthlyGhi: MonthlyGhi = {
    jan: 4,
    feb: 4,
    mar: 4,
    apr: 4,
    may: 4,
    jun: 6,
    jul: 5,
    aug: 5.5,
    sep: 4,
    oct: 4,
    nov: 4,
    dec: 4
  };
  const inverter = inverters.find(item => item.id === 'ecoflow-delta-pro')!;

  return {
    ...defaultBuild,
    name: 'Weekend cabin',
    id: 'build-1',
    appliances: [
      {
        id: 'fridge',
        name: 'Fridge',
        wattage: 500,
        hours: 3,
        quantity: 2,
        usageType: 'continuous',
        applianceGroup: 'Kitchen'
      },
      {
        id: 'microwave',
        name: 'Microwave',
        wattage: 1200,
        hours: 1,
        quantity: 1,
        usageType: 'intermittent',
        applianceGroup: 'Kitchen'
      }
    ],
    seasons: ['summer'],
    zipCode: '94107',
    monthlyGhi,
    inverter: { ...inverter },
    batteries: [],
    powerSources: [],
    createdOn: new Date(),
    lastEdited: new Date()
  };
}
