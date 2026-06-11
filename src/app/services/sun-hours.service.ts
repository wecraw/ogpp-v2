import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse, HttpParams } from '@angular/common/http';
import { Observable, TimeoutError, catchError, map, switchMap, throwError, timeout } from 'rxjs';
import { environment } from '../../environments/environment';
import { Month, MonthlyGhi } from '../interfaces/Build';

type SunHoursLookupErrorCode = 'unknown-zip' | 'timeout' | 'no-data' | 'unavailable';

interface ZipLookupResponse {
  places?: {
    latitude: string;
    longitude: string;
  }[];
}

interface SolarResourceResponse {
  errors?: string[];
  outputs?: {
    avg_ghi?: {
      monthly?: Partial<Record<Month, number>>;
    };
  };
}

const MONTHS: Month[] = [
  'jan',
  'feb',
  'mar',
  'apr',
  'may',
  'jun',
  'jul',
  'aug',
  'sep',
  'oct',
  'nov',
  'dec'
];

export class SunHoursLookupError extends Error {
  constructor(
    public readonly code: SunHoursLookupErrorCode,
    message: string
  ) {
    super(message);
    this.name = 'SunHoursLookupError';
  }
}

@Injectable({
  providedIn: 'root'
})
export class SunHoursService {
  constructor(private http: HttpClient) {}

  getSunHoursByZip(zip: string): Observable<MonthlyGhi> {
    return this.http.get<ZipLookupResponse>(`${environment.zipLookupUrl}/${zip}`).pipe(
      switchMap(response => {
        const place = response.places?.[0];
        const latitude = Number(place?.latitude);
        const longitude = Number(place?.longitude);

        if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) {
          return throwError(
            () => new SunHoursLookupError('unknown-zip', 'The ZIP code could not be located.')
          );
        }

        const params = new HttpParams()
          .set('lat', latitude)
          .set('lon', longitude)
          .set('api_key', environment.nlrApiKey);

        return this.http.get<SolarResourceResponse>(environment.nlrSolarResourceUrl, { params });
      }),
      map(response => this.extractMonthlyGhi(response)),
      timeout(environment.sunHoursRequestTimeoutMs),
      catchError(error => throwError(() => this.normalizeError(error)))
    );
  }

  private extractMonthlyGhi(response: SolarResourceResponse): MonthlyGhi {
    const monthlyGhi = response.outputs?.avg_ghi?.monthly;
    const hasEveryMonth = MONTHS.every(
      month => Number.isFinite(monthlyGhi?.[month]) && Number(monthlyGhi?.[month]) > 0
    );

    if (response.errors?.length || !monthlyGhi || !hasEveryMonth) {
      throw new SunHoursLookupError('no-data', 'No complete solar resource data was returned.');
    }

    return monthlyGhi as MonthlyGhi;
  }

  private normalizeError(error: unknown): SunHoursLookupError {
    if (error instanceof SunHoursLookupError) {
      return error;
    }

    if (error instanceof TimeoutError) {
      return new SunHoursLookupError('timeout', 'The solar resource lookup timed out.');
    }

    if (error instanceof HttpErrorResponse && error.status === 404) {
      return new SunHoursLookupError('unknown-zip', 'The ZIP code could not be located.');
    }

    return new SunHoursLookupError('unavailable', 'The solar resource lookup is unavailable.');
  }
}
