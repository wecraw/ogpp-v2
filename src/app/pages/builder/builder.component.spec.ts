import { fakeAsync, flushMicrotasks, TestBed, tick } from '@angular/core/testing';
import { ActivatedRoute, Router } from '@angular/router';
import { of, throwError } from 'rxjs';
import { Build, defaultBuild, MonthlyGhi } from '../../interfaces/Build';
import { BuildService } from '../../services/build.service';
import { SunHoursLookupError, SunHoursService } from '../../services/sun-hours.service';
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
    expect(router.navigate).toHaveBeenCalledWith(['/build'], {
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
