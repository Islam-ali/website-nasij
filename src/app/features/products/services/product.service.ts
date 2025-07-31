import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from '../../../../environments/environment';
import { IVariant } from '../models/variant.interface';
import { IProduct, IProductListResponse, IProductQueryParams } from '../models/product.interface';
import { BaseResponse, pagination } from '../../../core/models/baseResponse';

@Injectable({
  providedIn: 'root'
})
export class ProductService {
  private apiUrl = `${environment.apiUrl}/products`;

  constructor(private http: HttpClient) {}

  getProducts(params?: IProductQueryParams): Observable<BaseResponse<{products: IProduct[], pagination: pagination}>> {
    let httpParams = new HttpParams();
    
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          httpParams = httpParams.append(key, value.toString());
        }
      });
    }

    return this.http.get<BaseResponse<{products: IProduct[], pagination: pagination}>>(this.apiUrl, { params: httpParams });
  }

  getNewArrivals(limit: number = 4): Observable<BaseResponse<{products: IProduct[], pagination: pagination}>> {
    const params: IProductQueryParams = {
      limit: limit,
      sortBy: 'createdAt',
      sortOrder: 'desc'
    };
    return this.getProducts(params).pipe(
      map(response => response)
    );
  }

  getProductById(id: string): Observable<BaseResponse<IProduct>> {
    return this.http.get<BaseResponse<IProduct>>(`${this.apiUrl}/${id}`);
  }

  getProductBySlug(slug: string): Observable<BaseResponse<IProduct>> {
    return this.http.get<BaseResponse<IProduct>>(`${this.apiUrl}/slug/${slug}`);
  }

  getFeaturedProducts(limit: number = 8): Observable<BaseResponse<IProduct[]>> {
    return this.http.get<BaseResponse<IProduct[]>>(
      `${this.apiUrl}/featured`,
      { params: { limit: limit.toString() } }
    );
  }

  getRelatedProducts(productId: string, limit: number = 4): Observable<BaseResponse<IProduct[]>> {
    return this.http.get<BaseResponse<IProduct[]>>(
      `${this.apiUrl}/${productId}/related`,
      { params: { limit: limit.toString() } }
    );
  }

  getProductVariants(productId: string): Observable<IVariant[]> {
    return this.http.get<IVariant[]>(`${this.apiUrl}/${productId}/variants`);
  }

  searchProducts(query: string, params?: IProductQueryParams): Observable<BaseResponse<{products: IProduct[], pagination: pagination}>> {
    let httpParams = new HttpParams().set('q', query);
    
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          httpParams = httpParams.append(key, value.toString());
        }
      });
    }

    return this.http.get<BaseResponse<{products: IProduct[], pagination: pagination}>>(`${this.apiUrl}/search`, { params: httpParams });
  }
}
