import { TestBed } from '@angular/core/testing';

import { SunHoursService } from './sun-hours.service';

describe('SunHoursService', () => {
  let service: SunHoursService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(SunHoursService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
