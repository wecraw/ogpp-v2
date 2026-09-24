import { TestBed } from '@angular/core/testing';
import { ActivatedRoute, Router } from '@angular/router';
import { of } from 'rxjs';

import { ShareComponent } from './share.component';
import { inverters } from 'src/app/content/inverters';
import { Build, defaultBuild } from 'src/app/interfaces/Build';
import { BuildService } from 'src/app/services/build.service';
import { BuildShareService } from 'src/app/services/build-share.service';
import { CalculationUtilsService } from 'src/app/services/calculation-utils.service';
import { ProductSelectorService } from 'src/app/services/product-selector.service';

describe('ShareComponent', () => {
  const navigate = jasmine.createSpy('navigate');

  beforeEach(() => {
    localStorage.clear();
    navigate.calls.reset();
  });

  afterEach(() => localStorage.clear());

  function create(fragment: string | null) {
    TestBed.configureTestingModule({
      imports: [ShareComponent],
      providers: [
        { provide: ActivatedRoute, useValue: { fragment: of(fragment) } },
        { provide: Router, useValue: { navigate } }
      ]
    });
    const fixture = TestBed.createComponent(ShareComponent);
    fixture.detectChanges();
    return fixture.componentInstance;
  }

  // Encoding is pure, so a standalone instance avoids depending on the TestBed injector.
  function encode(build: Build): string {
    return new BuildShareService(
      new BuildService(),
      new ProductSelectorService(new CalculationUtilsService())
    ).encode(build);
  }

  it('imports a shared build and opens it on /build', () => {
    create(encode({ ...defaultBuild, name: 'Van', inverter: inverters[0] }));

    const [saved] = TestBed.inject(BuildService).listBuilds();
    expect(saved.name).toBe('Van');
    expect(navigate).toHaveBeenCalledWith(['/build'], {
      queryParams: { buildId: saved.id },
      replaceUrl: true
    });
  });

  it('opens a build with no station on /results', () => {
    create(encode({ ...defaultBuild, name: 'Draft' }));

    const [saved] = TestBed.inject(BuildService).listBuilds();
    expect(navigate).toHaveBeenCalledWith(['/results'], {
      queryParams: { buildId: saved.id },
      replaceUrl: true
    });
  });

  it('shows an error for a missing or broken payload', () => {
    expect(create(null).invalidLink).toBeTrue();
    TestBed.resetTestingModule();
    expect(create('broken').invalidLink).toBeTrue();
    expect(navigate).not.toHaveBeenCalled();
  });
});
