import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from '../../../../environments/environment';
import { IVariant } from '../models/variant.interface';
import { BaseResponse, pagination } from '../../../core/models/baseResponse';
import { IProductQueryParams, ProductVariant, ProductVariantAttribute } from '../models/product.interface';
import { IProduct } from '../models/product.interface';

@Injectable({
  providedIn: 'root'
})
export class ProductService {
  private apiUrl = `${environment.apiUrl}/products`;

  constructor(private http: HttpClient) {}

  getProducts(params?: IProductQueryParams): Observable<BaseResponse<{products: IProduct[], pagination: pagination}>> {
    let httpParams = new HttpParams();
    if (params && typeof params === 'object') {
      Object.entries(params).forEach(([key, value]) => {
        if (value == undefined || value == null || value == '' || value.length == 0) {
          return;
        }
        httpParams = httpParams.append(key, value);
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
    
    if (params && typeof params === 'object') {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          httpParams = httpParams.append(key, value.toString());
        }
      });
    }

    return this.http.get<BaseResponse<{products: IProduct[], pagination: pagination}>>(`${this.apiUrl}/search`, { params: httpParams });
  }

  getUniqueAttributes(items: ProductVariant[]): {variant:string, attributes:ProductVariantAttribute[]}[] {
    const map = new Map<string, ProductVariantAttribute[]>();
  
    items.forEach((item) => {
      item.attributes?.forEach((attr) => {
        if (!map.has(attr.variant)) {
          map.set(attr.variant, []);
        }
  
        const existing = map.get(attr.variant)!;
        const isDuplicate = existing.some(
        (val) => val.value.en === attr.value.en && val.value.ar === attr.value.ar
        );
  
        if (!isDuplicate) {
          existing.push(attr);
        }
      });
    });
  
    return Array.from(map.entries()).map(([variant, attributes]) => ({
      variant,
      attributes
    }));
  }
}
