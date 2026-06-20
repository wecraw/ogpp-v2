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
    expect(component.inverters.map(inverter => inverter.id)).toEqual([
      'ecoflow-delta-pro-ultra',
      'ecoflow-delta-pro-3',
      'ecoflow-delta-pro',
      'bluetti-ac200max'
    ]);
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
