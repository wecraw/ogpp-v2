import { fakeAsync, TestBed, tick } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { environment } from '../../environments/environment';
import { MonthlyGhi } from '../interfaces/Build';
import { SunHoursLookupError, SunHoursService } from './sun-hours.service';

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

describe('SunHoursService', () => {
  let service: SunHoursService;
  let httpTesting: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()]
    });
    service = TestBed.inject(SunHoursService);
    httpTesting = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpTesting.verify({ ignoreCancelled: true });
  });

  it('looks up ZIP coordinates and returns monthly GHI', () => {
    let result: MonthlyGhi | undefined;

    service.getSunHoursByZip('90210').subscribe(monthlyGhi => (result = monthlyGhi));

    const zipRequest = httpTesting.expectOne(`${environment.zipLookupUrl}/90210`);
    zipRequest.flush({
      places: [{ latitude: '34.0901', longitude: '-118.4065' }]
    });

    const solarRequest = httpTesting.expectOne(request => {
      return (
        request.url === environment.nlrSolarResourceUrl &&
        request.params.get('lat') === '34.0901' &&
        request.params.get('lon') === '-118.4065' &&
        request.params.get('api_key') === environment.nlrApiKey
      );
    });
    solarRequest.flush({
      errors: [],
      outputs: { avg_ghi: { monthly: MONTHLY_GHI } }
    });

    expect(result).toEqual(MONTHLY_GHI);
  });

  it('reports an unknown ZIP when coordinate lookup returns 404', () => {
    let resultError: SunHoursLookupError | undefined;

    service.getSunHoursByZip('00000').subscribe({
      error: error => (resultError = error)
    });

    httpTesting
      .expectOne(`${environment.zipLookupUrl}/00000`)
      .flush(null, { status: 404, statusText: 'Not Found' });

    expect(resultError?.code).toBe('unknown-zip');
  });

  it('reports missing solar data when NLR returns an API error', () => {
    let resultError: SunHoursLookupError | undefined;

    service.getSunHoursByZip('90210').subscribe({
      error: error => (resultError = error)
    });

    httpTesting
      .expectOne(`${environment.zipLookupUrl}/90210`)
      .flush({ places: [{ latitude: '34.0901', longitude: '-118.4065' }] });
    httpTesting.expectOne(request => request.url === environment.nlrSolarResourceUrl).flush({
      errors: ['No data is available for this location.'],
      outputs: {}
    });

    expect(resultError?.code).toBe('no-data');
  });

  it('times out a stalled lookup', fakeAsync(() => {
    let resultError: SunHoursLookupError | undefined;

    service.getSunHoursByZip('90210').subscribe({
      error: error => (resultError = error)
    });

    const request = httpTesting.expectOne(`${environment.zipLookupUrl}/90210`);
    tick(environment.sunHoursRequestTimeoutMs);

    expect(request.cancelled).toBeTrue();
    expect(resultError?.code).toBe('timeout');
  }));
});
