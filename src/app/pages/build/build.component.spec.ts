import { ComponentFixture, TestBed, fakeAsync, flush } from '@angular/core/testing';
import { ActivatedRoute, Router } from '@angular/router';
import { of } from 'rxjs';
import { CATALOG_FIXTURE, provideCatalogFixture } from 'src/testing/catalog-fixture';

const { inverters, batteries, solarPanels } = CATALOG_FIXTURE;
import { Build, defaultBuild, MonthlyGhi } from 'src/app/interfaces/Build';
import { BuildService } from 'src/app/services/build.service';

import { BuildComponent } from './build.component';

describe('BuildComponent', () => {
  it('marks the page as not found when the query build does not exist', () => {
    const { component, fixture } = setup(null);

    fixture.detectChanges();

    expect(component.buildNotFound).toBeTrue();
  });

  it('loads a saved build and derives recommendation targets', () => {
    const build = createBuild();
    const { component, fixture } = setup(build);

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

  it('caps battery quantity to the bank total across models', () => {
    const { component, fixture } = setup(createBuild());

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

  it('caps solar quantity to the station maxSolarInput headroom', () => {
    const { component, fixture } = setup(createBuild());

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

  // Fixture math (DELTA Pro, 3,600 Wh built in, 3,600 Wh expansion battery):
  //   battery target = 4,200 Wh/day × 2 days = 8,400 Wh → needs built-in + 2 batteries
  //   solar target   = 4,200 Wh ÷ 5 sun-hours  =   840 W → needs three 400 W panels
  describe('compatibility flow', () => {
    it('marks each step compatible only once its target is met', fakeAsync(() => {
      const { component, fixture } = setup(createBuild());
      fixture.detectChanges();
      const battery = component.batteries[0];
      const panel = component.solarPanels.find(item => item.maxOutput === 400)!;

      expect(component.isInverterCompatible).toBeTrue();
      expect(component.isBatteryCompatible).toBeFalse();
      expect(component.allComplete).toBeFalse();

      component.onBatteryQuantityChange(battery, 1);
      expect(component.selectedBatteryCapacity).toBe(7200);
      expect(component.isBatteryCompatible).toBeFalse();

      component.onBatteryQuantityChange(battery, 2);
      expect(component.selectedBatteryCapacity).toBe(10800);
      expect(component.isBatteryCompatible).toBeTrue();

      component.onSolarQuantityChange(panel, 2);
      expect(component.isSolarCompatible).toBeFalse();
      expect(component.solarRowClass).toBe('incompatible');

      component.onSolarQuantityChange(panel, 3);
      expect(component.isSolarCompatible).toBeTrue();
      expect(component.allComplete).toBeTrue();

      flush();
      expect(component.showStep3).toBeTrue();
      expect(component.showSolarCheck).toBeTrue();
    }));

    it('persists quantities as duplicate entries on every change', fakeAsync(() => {
      const { component, fixture, buildService } = setup(createBuild());
      fixture.detectChanges();
      const battery = component.batteries[0];

      component.onBatteryQuantityChange(battery, 2);
      flush();

      const saved = buildService.saveBuild.calls.mostRecent().args[0];
      expect(saved.batteries.length).toBe(2);
      expect(saved.batteries.every(item => item.id === battery.id)).toBeTrue();
    }));

    it('resets downstream selections when the inverter changes', fakeAsync(() => {
      const { component, fixture } = setup(createBuild());
      fixture.detectChanges();
      component.onBatteryQuantityChange(component.batteries[0], 2);

      const other = component.inverters.find(item => item.id !== 'ecoflow-delta-pro')!;
      component.onInverterSelect(true, other);
      flush();

      expect(component.build.inverter.id).toBe(other.id);
      expect(component.build.batteries).toEqual([]);
      expect(component.build.powerSources).toEqual([]);
      expect(component.batteryQuantities).toEqual({});
      expect(component.solarQuantities).toEqual({});
    }));

    it('finishes by saving and routing to checkout', () => {
      const { component, fixture, buildService, router } = setup(createBuild());
      fixture.detectChanges();
      buildService.saveBuild.calls.reset();

      component.finish();

      expect(buildService.saveBuild).toHaveBeenCalled();
      expect(router.navigate).toHaveBeenCalledWith(['/checkout'], {
        queryParams: { buildId: 'build-1' }
      });
    });
  });

  describe('restoring a saved build', () => {
    it('rebuilds quantity maps from duplicate entries', () => {
      const build = createBuild();
      const battery = batteries.find(item => item.id === 'ecoflow-delta-pro-smart-battery')!;
      const panel = solarPanels.find(item => item.id === 'ecoflow-400w-portable-solar-panel')!;
      build.batteries = [battery, battery];
      build.powerSources = [panel, panel, panel];

      const { component, fixture } = setup(build);
      fixture.detectChanges();

      expect(component.batteryQuantities).toEqual({ [battery.id!]: 2 });
      expect(component.solarQuantities).toEqual({ [panel.id!]: 3 });
      expect(component.allComplete).toBeTrue();
      expect(component.showStep2).toBeTrue();
      expect(component.showStep3).toBeTrue();
    });

    it('drops gear left over from a previously chosen inverter', () => {
      const build = createBuild();
      const foreign = batteries.find(item => item.brand !== 'EcoFlow')!;
      build.batteries = [foreign];

      const { component, fixture, buildService } = setup(build);
      fixture.detectChanges();

      expect(component.batteryQuantities).toEqual({});
      expect(component.remainingBatterySlots).toBe(2);
      // The scrubbed build is persisted so /checkout doesn't read the phantom back.
      const saved = buildService.saveBuild.calls.mostRecent().args[0];
      expect(saved.batteries).toEqual([]);
    });
  });

  describe('days of autonomy', () => {
    it('defaults builds that predate the field and scales the battery target', () => {
      const { component, fixture } = setup(createBuild());
      fixture.detectChanges();

      expect(component.daysOfAutonomy).toBe(2);
      expect(component.build.daysOfAutonomy).toBe(2);
      expect(component.batteryTarget).toBe(8400);
    });

    it('restores a saved value', () => {
      const { component, fixture } = setup({ ...createBuild(), daysOfAutonomy: 4 });
      fixture.detectChanges();

      expect(component.daysOfAutonomy).toBe(4);
      expect(component.batteryTarget).toBe(16800);
    });

    it('clamps changes to the 1–7 day range', fakeAsync(() => {
      const { component, fixture } = setup(createBuild());
      fixture.detectChanges();

      component.changeDaysOfAutonomy(-5);
      expect(component.daysOfAutonomy).toBe(1);

      component.changeDaysOfAutonomy(20);
      expect(component.daysOfAutonomy).toBe(7);
      flush();
    }));

    it('re-evaluates battery compatibility when the target changes', fakeAsync(() => {
      const { component, fixture } = setup(createBuild());
      fixture.detectChanges();
      component.onBatteryQuantityChange(component.batteries[0], 1);
      expect(component.isBatteryCompatible).toBeFalse();

      // One day → 4,200 Wh target, which built-in + one battery (7,200 Wh) covers.
      component.changeDaysOfAutonomy(-1);

      expect(component.isBatteryCompatible).toBeTrue();
      expect(component.build.daysOfAutonomy).toBe(1);
      flush();
    }));
  });

  describe('rename', () => {
    it('falls back to the station name when the build is unnamed', () => {
      const { component, fixture } = setup({ ...createBuild(), name: '  ' });
      fixture.detectChanges();

      expect(component.buildDisplayName).toBe('DELTA Pro');
    });

    it('saves a trimmed name', () => {
      const { component, fixture, buildService } = setup(createBuild());
      fixture.detectChanges();

      component.startRename();
      expect(component.draftName).toBe('Weekend cabin');
      component.draftName = '  Cabin kit  ';
      component.saveRename();

      expect(component.build.name).toBe('Cabin kit');
      expect(component.isRenaming).toBeFalse();
      expect(buildService.saveBuild.calls.mostRecent().args[0].name).toBe('Cabin kit');
    });

    it('discards the draft on cancel', () => {
      const { component, fixture } = setup(createBuild());
      fixture.detectChanges();

      component.startRename();
      component.draftName = 'Something else';
      component.cancelRename();

      expect(component.build.name).toBe('Weekend cabin');
      expect(component.isRenaming).toBeFalse();
    });
  });
});

// Synchronous (no compileComponents — the CLI builder inlines templates) so it can run
// inside fakeAsync, which the step-reveal setTimeouts need.
function setup(savedBuild: Build | null): {
  component: BuildComponent;
  fixture: ComponentFixture<BuildComponent>;
  buildService: jasmine.SpyObj<BuildService>;
  router: jasmine.SpyObj<Router>;
} {
  const buildService = jasmine.createSpyObj<BuildService>('BuildService', [
    'getBuild',
    'saveBuild'
  ]);
  const router = jasmine.createSpyObj<Router>('Router', ['navigate']);
  buildService.getBuild.and.returnValue(savedBuild);

  TestBed.configureTestingModule({
    imports: [BuildComponent],
    providers: [
      provideCatalogFixture(),
      {
        provide: ActivatedRoute,
        useValue: { queryParams: of({ buildId: 'build-1' }) }
      },
      { provide: Router, useValue: router },
      { provide: BuildService, useValue: buildService }
    ]
  });

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
