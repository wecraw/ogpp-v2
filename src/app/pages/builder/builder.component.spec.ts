import { fakeAsync, flushMicrotasks, TestBed, tick } from '@angular/core/testing';
import { ActivatedRoute, Router } from '@angular/router';
import { of, throwError } from 'rxjs';
import { Build, defaultBuild, MonthlyGhi } from '../../interfaces/Build';
import { Appliance } from '../../interfaces/Appliance';
import { BuildService } from '../../services/build.service';
import { SunHoursLookupError, SunHoursService } from '../../services/sun-hours.service';
import { isCustomApplianceId } from '../../content/catalog-utils';
import { BuilderComponent } from './builder.component';

const MONTHLY_GHI: MonthlyGhi = {
  jan: 2.5,
  feb: 3.43,
  mar: 4.69,
  apr: 5.69,
  may: 6.6,
  jun: 7.25,
  jul: 7.14,
  aug: 6.24,
  sep: 5.35,
  oct: 3.85,
  nov: 2.75,
  dec: 2.19
};

describe('BuilderComponent', () => {
  let component: BuilderComponent;
  let sunHoursService: jasmine.SpyObj<SunHoursService>;
  let buildService: jasmine.SpyObj<BuildService>;
  let router: jasmine.SpyObj<Router>;

  beforeEach(async () => {
    sunHoursService = jasmine.createSpyObj<SunHoursService>('SunHoursService', [
      'getSunHoursByZip'
    ]);
    buildService = jasmine.createSpyObj<BuildService>('BuildService', ['getBuild', 'saveBuild']);
    router = jasmine.createSpyObj<Router>('Router', ['navigate']);
    buildService.getBuild.and.returnValue(null);
    router.navigate.and.resolveTo(true);

    await TestBed.configureTestingModule({
      imports: [BuilderComponent],
      providers: [
        { provide: ActivatedRoute, useValue: { queryParams: of({}) } },
        { provide: Router, useValue: router },
        { provide: SunHoursService, useValue: sunHoursService },
        { provide: BuildService, useValue: buildService }
      ]
    }).compileComponents();

    const fixture = TestBed.createComponent(BuilderComponent);
    component = fixture.componentInstance;
    component.build = createBuild();
    fixture.detectChanges();
  });

  it('creates', () => {
    expect(component).toBeTruthy();
  });

  it('saves and navigates after a successful solar lookup', fakeAsync(() => {
    component.zipCode = '90210';
    sunHoursService.getSunHoursByZip.and.returnValue(of(MONTHLY_GHI));

    component.generateBuild();
    flushMicrotasks();

    expect(component.build.zipCode).toBe('90210');
    expect(component.build.monthlyGhi).toEqual(MONTHLY_GHI);
    expect(buildService.saveBuild).toHaveBeenCalledWith(component.build);

    tick(1200);
    expect(router.navigate).toHaveBeenCalledWith(['/results'], {
      queryParams: { buildId: component.build.id }
    });
  }));

  it('shows a user-visible error and does not save when the lookup fails', fakeAsync(() => {
    component.zipCode = '00000';
    sunHoursService.getSunHoursByZip.and.returnValue(
      throwError(() => new SunHoursLookupError('unknown-zip', 'Unknown ZIP'))
    );

    component.generateBuild();
    flushMicrotasks();

    expect(component.generatingBuild).toBeFalse();
    expect(component.sunHoursError).toContain("couldn't find that ZIP code");
    expect(buildService.saveBuild).not.toHaveBeenCalled();
    expect(router.navigate).not.toHaveBeenCalled();
  }));

  describe('custom appliances', () => {
    const customDraft = (overrides: Partial<Appliance> = {}): Appliance => ({
      name: 'Well pump',
      wattage: 800,
      hours: 2,
      quantity: 1,
      usageType: 'continuous',
      applianceGroup: 'Custom',
      ...overrides
    });

    it('adds a custom appliance: rendered, auto-selected, counted, with a custom id', () => {
      component.addCustomAppliance(customDraft());

      const added = component.allAppliances.find(a => a.name === 'Well pump');
      expect(added).toBeTruthy();
      expect(isCustomApplianceId(added!.id)).toBeTrue();
      expect(component.isApplianceSelected(added!.id!)).toBeTrue();
      expect(component.applianceGroups).toContain('Custom');
      // 800 W continuous contributes in full to peak wattage.
      expect(component.peakWattage).toBe(800);
      expect(component.totalWattHours).toBe(800 * 2);
    });

    it('respects usageType in the coincident-load calc for customs', () => {
      component.addCustomAppliance(customDraft({ name: 'Fan', wattage: 60 }));
      component.addCustomAppliance(
        customDraft({ name: 'Kettle', wattage: 1500, usageType: 'intermittent' })
      );

      // 60 W continuous + single largest intermittent (1500 W).
      expect(component.peakWattage).toBe(60 + 1500);
    });

    it('gives duplicate-named customs distinct ids', () => {
      component.addCustomAppliance(customDraft({ name: 'Pump' }));
      component.addCustomAppliance(customDraft({ name: 'Pump' }));

      const ids = component.allAppliances.filter(a => a.name === 'Pump').map(a => a.id);
      expect(new Set(ids).size).toBe(2);
    });

    it('deletes a custom appliance from the catalog, build and totals', () => {
      component.addCustomAppliance(customDraft());
      const added = component.allAppliances.find(a => a.name === 'Well pump')!;

      component.deleteAppliance(added);

      expect(component.allAppliances.some(a => a.id === added.id)).toBeFalse();
      expect(component.build.appliances.some(a => a.id === added.id)).toBeFalse();
      expect(component.applianceGroups).not.toContain('Custom');
      expect(component.peakWattage).toBe(0);
      expect(component.totalWattHours).toBe(0);
    });
  });
});

describe('BuilderComponent reload reconciliation', () => {
  it('re-injects a saved custom appliance so it renders and stays selected', () => {
    const custom: Appliance = {
      id: 'custom-well-pump',
      name: 'Well pump',
      wattage: 800,
      hours: 2,
      quantity: 1,
      usageType: 'continuous',
      applianceGroup: 'Custom'
    };
    const savedBuild: Build = {
      ...createBuild(),
      id: 'build-1',
      appliances: [custom]
    };

    const sunHoursService = jasmine.createSpyObj<SunHoursService>('SunHoursService', [
      'getSunHoursByZip'
    ]);
    const buildService = jasmine.createSpyObj<BuildService>('BuildService', [
      'getBuild',
      'saveBuild'
    ]);
    const router = jasmine.createSpyObj<Router>('Router', ['navigate']);
    buildService.getBuild.and.returnValue(savedBuild);

    TestBed.configureTestingModule({
      imports: [BuilderComponent],
      providers: [
        { provide: ActivatedRoute, useValue: { queryParams: of({ buildId: 'build-1' }) } },
        { provide: Router, useValue: router },
        { provide: SunHoursService, useValue: sunHoursService },
        { provide: BuildService, useValue: buildService }
      ]
    });

    const fixture = TestBed.createComponent(BuilderComponent);
    fixture.detectChanges();
    const component = fixture.componentInstance;

    const reloaded = component.allAppliances.find(a => a.id === 'custom-well-pump');
    expect(reloaded).toBeTruthy();
    expect(reloaded!.name).toBe('Well pump');
    expect(component.applianceGroups).toContain('Custom');
    expect(component.isApplianceSelected('custom-well-pump')).toBeTrue();
    expect(component.getAppliancesByGroup('Custom').length).toBe(1);
  });
});

describe('BuilderComponent preset overrides', () => {
  let component: BuilderComponent;

  beforeEach(async () => {
    const sunHoursService = jasmine.createSpyObj<SunHoursService>('SunHoursService', [
      'getSunHoursByZip'
    ]);
    const buildService = jasmine.createSpyObj<BuildService>('BuildService', [
      'getBuild',
      'saveBuild'
    ]);
    const router = jasmine.createSpyObj<Router>('Router', ['navigate']);
    buildService.getBuild.and.returnValue(null);

    await TestBed.configureTestingModule({
      imports: [BuilderComponent],
      providers: [
        { provide: ActivatedRoute, useValue: { queryParams: of({}) } },
        { provide: Router, useValue: router },
        { provide: SunHoursService, useValue: sunHoursService },
        { provide: BuildService, useValue: buildService }
      ]
    }).compileComponents();

    const fixture = TestBed.createComponent(BuilderComponent);
    component = fixture.componentInstance;
    component.build = createBuild();
    fixture.detectChanges();
  });

  it('reverts a deselected appliance to its catalog default so overrides do not linger', () => {
    const preset = component.appliancePresets[0];
    // Target an item the preset overrides via quantity, so a lingering value
    // would visibly differ from the catalog default.
    const item = preset.items.find(i => i.quantity !== undefined)!;
    const overrideQty = item.quantity!;
    const original = component.getOriginalApplianceById(item.applianceId)!;
    expect(overrideQty).not.toBe(original.quantity); // guard against a vacuous test

    component.applyPreset(preset);
    expect(
      component.build.appliances.find(a => a.id === item.applianceId)!.quantity
    ).toBe(overrideQty);

    // Manually deselect every appliance the preset added, emptying the selection
    // (the path that previously left stale override values behind).
    for (const presetItem of preset.items) {
      component.onApplianceSelect(presetItem.applianceId);
    }
    expect(component.isAnyApplianceSelected()).toBeFalse();

    // Re-selecting must pick up the catalog default, not the preset override.
    component.onApplianceSelect(item.applianceId);
    const reselected = component.build.appliances.find(a => a.id === item.applianceId)!;
    expect(reselected.quantity).toBe(original.quantity);
  });
});

function createBuild(): Build {
  return {
    ...defaultBuild,
    appliances: [],
    seasons: ['summer'],
    powerSources: [],
    inverter: { ...defaultBuild.inverter },
    batteries: [],
    createdOn: new Date(),
    lastEdited: new Date()
  };
}
