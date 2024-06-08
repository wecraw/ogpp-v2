import { TestBed } from '@angular/core/testing';

import { CalculationUtilsService } from './calculation-utils.service';

describe('CalculationUtilsService', () => {
  let service: CalculationUtilsService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(CalculationUtilsService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
