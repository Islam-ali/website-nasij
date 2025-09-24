import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { ICountry, IState, ILocation } from '../models/location.interface';

@Injectable({
  providedIn: 'root'
})
export class LocationService {
  private readonly apiUrl = `${environment.apiUrl}/locations`;

  constructor(private http: HttpClient) {}

  // Get all countries
  getCountries(): Observable<ICountry[]> {
    return this.http.get<ICountry[]>(`${this.apiUrl}/countries`).pipe(
      catchError(error => {
        console.error('Error fetching countries:', error);
        return of(this.getDefaultCountries());
      })
    );
  }

  // Get states by country ID
  getStatesByCountry(countryId: string): Observable<IState[]> {
    return this.http.get<IState[]>(`${this.apiUrl}/states/country/${countryId}`).pipe(
      catchError(error => {
        console.error('Error fetching states:', error);
        // Fallback to default countries' states
        const defaultCountries = this.getDefaultCountries();
        const country = defaultCountries.find(c => c._id === countryId);
        return of(country?.states || []);
      })
    );
  }

  // Get shipping cost for specific location
  getShippingCost(countryId: string, stateId?: string): Observable<number> {
    const url = stateId 
      ? `${this.apiUrl}/shipping-cost/${countryId}/${stateId}`
      : `${this.apiUrl}/shipping-cost/${countryId}`;
    
    return this.http.get<{ shippingCost: number }>(url).pipe(
      map(response => response.shippingCost),
      catchError(error => {
        console.error('Error fetching shipping cost:', error);
        return of(0);
      })
    );
  }

  // Calculate shipping cost locally
  calculateShippingCost(country: ICountry, state?: IState): number {
    if (state) {
      return state.shippingCost;
    }
    return country.defaultShippingCost;
  }

  // Get default countries (fallback data)
  private getDefaultCountries(): ICountry[] {
    return [
      {
        _id: '1',
        name: { en: 'United States', ar: 'الولايات المتحدة' },
        code: 'US',
        defaultShippingCost: 10,
        isActive: true,
        states: [
          {
            _id: '1',
            name: { en: 'California', ar: 'كاليفورنيا' },
            code: 'CA',
            shippingCost: 8,
            isActive: true
          },
          {
            _id: '2',
            name: { en: 'New York', ar: 'نيويورك' },
            code: 'NY',
            shippingCost: 12,
            isActive: true
          },
          {
            _id: '3',
            name: { en: 'Texas', ar: 'تكساس' },
            code: 'TX',
            shippingCost: 9,
            isActive: true
          }
        ]
      },
      {
        _id: '2',
        name: { en: 'Canada', ar: 'كندا' },
        code: 'CA',
        defaultShippingCost: 15,
        isActive: true,
        states: [
          {
            _id: '4',
            name: { en: 'Ontario', ar: 'أونتاريو' },
            code: 'ON',
            shippingCost: 12,
            isActive: true
          },
          {
            _id: '5',
            name: { en: 'British Columbia', ar: 'كولومبيا البريطانية' },
            code: 'BC',
            shippingCost: 14,
            isActive: true
          }
        ]
      },
      {
        _id: '3',
        name: { en: 'United Kingdom', ar: 'المملكة المتحدة' },
        code: 'GB',
        defaultShippingCost: 20,
        isActive: true,
        states: [
          {
            _id: '6',
            name: { en: 'England', ar: 'إنجلترا' },
            code: 'ENG',
            shippingCost: 18,
            isActive: true
          },
          {
            _id: '7',
            name: { en: 'Scotland', ar: 'اسكتلندا' },
            code: 'SCT',
            shippingCost: 22,
            isActive: true
          }
        ]
      },
      {
        _id: '4',
        name: { en: 'Germany', ar: 'ألمانيا' },
        code: 'DE',
        defaultShippingCost: 25,
        isActive: true,
        states: [
          {
            _id: '8',
            name: { en: 'Bavaria', ar: 'بافاريا' },
            code: 'BY',
            shippingCost: 23,
            isActive: true
          },
          {
            _id: '9',
            name: { en: 'Berlin', ar: 'برلين' },
            code: 'BE',
            shippingCost: 24,
            isActive: true
          }
        ]
      },
      {
        _id: '5',
        name: { en: 'Saudi Arabia', ar: 'المملكة العربية السعودية' },
        code: 'SA',
        defaultShippingCost: 30,
        isActive: true,
        states: [
          {
            _id: '10',
            name: { en: 'Riyadh', ar: 'الرياض' },
            code: 'RIY',
            shippingCost: 25,
            isActive: true
          },
          {
            _id: '11',
            name: { en: 'Jeddah', ar: 'جدة' },
            code: 'JED',
            shippingCost: 28,
            isActive: true
          },
          {
            _id: '12',
            name: { en: 'Dammam', ar: 'الدمام' },
            code: 'DAM',
            shippingCost: 32,
            isActive: true
          }
        ]
      }
    ];
  }
}