import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { BaseResponse } from '../core/models/baseResponse';
import { IProductFeature } from '../interfaces/product-feature.interface';
import { IProduct } from '../features/products/models/product.interface';

@Injectable({
  providedIn: 'root',
})
export class ProductFeaturesService {
  private apiUrl = `${environment.apiUrl}/product-features`;

  constructor(private http: HttpClient) {}

  getAllActive(): Observable<BaseResponse<IProductFeature[]>> {
    return this.http.get<BaseResponse<IProductFeature[]>>(`${this.apiUrl}/active`);
  }

  getFeatureProducts(id: string): Observable<BaseResponse<IProduct[]>> {
    return this.http.get<BaseResponse<IProduct[]>>(`${this.apiUrl}/${id}/products`);
  }
}

