import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';

import { BuildsComponent } from './builds.component';
import { BuildService } from 'src/app/services/build.service';
import { Build, defaultBuild } from 'src/app/interfaces/Build';

function makeBuild(overrides: Partial<Build>): Build {
  return { ...defaultBuild, ...overrides };
}

describe('BuildsComponent', () => {
  let component: BuildsComponent;
  let fixture: ComponentFixture<BuildsComponent>;
  let buildService: BuildService;

  beforeEach(async () => {
    localStorage.clear();

    await TestBed.configureTestingModule({
      imports: [BuildsComponent],
      providers: [provideRouter([])]
    }).compileComponents();

    buildService = TestBed.inject(BuildService);
  });

  function create() {
    fixture = TestBed.createComponent(BuildsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }

  it('should create', () => {
    create();
    expect(component).toBeTruthy();
  });

  it('shows an empty list when there are no saved builds', () => {
    create();
    expect(component.builds.length).toBe(0);
  });

  it('lists saved builds most-recently-edited first', () => {
    buildService.saveBuild(
      makeBuild({ id: 'a', lastEdited: new Date('2024-01-01') })
    );
    buildService.saveBuild(
      makeBuild({ id: 'b', lastEdited: new Date('2024-06-01') })
    );

    create();

    expect(component.builds.map(b => b.id)).toEqual(['b', 'a']);
  });

  it('summarizes key specs from the build', () => {
    buildService.saveBuild(
      makeBuild({
        id: 'specs',
        inverter: { ...defaultBuild.inverter, maxOutput: 3600, batteryCapacity: 4096 },
        batteries: [{ name: 'X', brand: 'B', batteryCapacity: 2048, price: 0 }],
        powerSources: [
          { name: 'P', brand: 'B', maxOutput: 400, price: 0 },
          { name: 'P', brand: 'B', maxOutput: 400, price: 0 }
        ]
      })
    );

    create();

    const summary = component.builds[0];
    expect(summary.output).toBe(3600);
    expect(summary.capacity).toBe(4096 + 2048);
    expect(summary.panelWattage).toBe(800);
  });

  it('falls back to the station name when a build is unnamed', () => {
    create();
    const named = component.displayName({
      name: '',
      station: 'DELTA Pro 3'
    } as any);
    expect(named).toBe('DELTA Pro 3');
  });

  it('renames a build and persists it', () => {
    buildService.saveBuild(makeBuild({ id: 'r', name: '' }));
    create();

    component.draftName = 'Cabin kit';
    component.saveRename('r');

    expect(buildService.getBuild('r')?.name).toBe('Cabin kit');
    expect(component.builds[0].name).toBe('Cabin kit');
  });

  it('duplicates a build under a new id', () => {
    buildService.saveBuild(makeBuild({ id: 'orig', name: 'Original' }));
    create();

    component.duplicate('orig');

    expect(component.builds.length).toBe(2);
    const copy = component.builds.find(b => b.id !== 'orig');
    expect(copy?.name).toBe('Original copy');
  });

  it('deletes a build after confirmation', () => {
    buildService.saveBuild(makeBuild({ id: 'del' }));
    create();

    component.confirmDelete('del');

    expect(buildService.getBuild('del')).toBeNull();
    expect(component.builds.length).toBe(0);
  });

  it('reopens a build by navigating with its id', () => {
    const router = TestBed.inject(Router);
    const navigate = spyOn(router, 'navigate');
    create();

    component.reopen('xyz');

    expect(navigate).toHaveBeenCalledWith(['/build'], { queryParams: { buildId: 'xyz' } });
  });
});
