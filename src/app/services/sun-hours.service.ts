import { Injectable } from '@angular/core';
import { HttpClient, HttpParams, HttpHeaders } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class SunHoursService {
  NREL_API_KEY = '7GomqbzvqApG7JXawpHoQYoNwwnwvJpeTPkFgb94';
  NREL_BASE_URI = 'https://developer.nrel.gov/api/solar/solar_resource/v1.json';

  constructor(private http: HttpClient) {}

  getSunHoursByZip(zip: string) {
    let params = new HttpParams().set('address', zip).set('api_key', this.NREL_API_KEY);
    const options = { params: params };

    return this.http.get(this.NREL_BASE_URI, options);
  }
}
