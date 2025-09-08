import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { IPackage, ValidatePackageOrderDto, IPackageOrderValidation } from '../../../interfaces/package.interface';
import { environment } from '../../../../environments/environment';
import { BaseResponse } from '../../../core/models/baseResponse';

@Injectable({
  providedIn: 'root'
})
export class PackageService {
  private apiUrl = `${environment.apiUrl}/packages`;
  constructor(private http: HttpClient) {}

  getPackages(queryParams?: any): Observable<BaseResponse<IPackage[]>> {
    return this.http.get<BaseResponse<IPackage[]>>(`${this.apiUrl}/active`, { params: queryParams });
  }

  getPackage(id: string): Observable<BaseResponse<IPackage>> {
    return this.http.get<BaseResponse<IPackage>>(`${this.apiUrl}/${id}`);
  }

  getPackagesByCategory(category: string): Observable<IPackage[]> {
    return this.http.get<IPackage[]>(`${this.apiUrl}/category/${category}`);
  }

  searchPackages(query: string): Observable<IPackage[]> {
    return this.http.get<IPackage[]>(`${this.apiUrl}/search?q=${query}`);
  }

  getRelatedPackages(packageId: string): Observable<IPackage[]> {
    return this.http.get<IPackage[]>(`${this.apiUrl}/${packageId}/related`);
  }

  validateOrder(validateData: ValidatePackageOrderDto): Observable<IPackageOrderValidation> {
    return this.http.post<IPackageOrderValidation>(`${this.apiUrl}/validate-order`, validateData);
  }

  getPackageInventory(packageId: string): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/${packageId}/inventory-summary`);
  }
} 