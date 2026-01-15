import { inject } from '@angular/core';
import { ResolveFn, ActivatedRouteSnapshot } from '@angular/router';
import { Observable, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { ProductService } from '../../features/products/services/product.service';
import { BaseResponse } from '../models/baseResponse';
import { IProduct } from '../../features/products/models/product.interface';

export const productResolver: ResolveFn<IProduct | null> = (route: ActivatedRouteSnapshot): Observable<IProduct | null> => {
  const productService = inject(ProductService);
  const productId = route.paramMap.get('id');

  if (!productId) {
    return of(null);
  }

  return productService.getProductById(productId).pipe(
    map((response: BaseResponse<IProduct>) => {
      if (response.success && response.data) {
        return response.data;
      }
      return null;
    }),
    catchError((error) => {
      // Return null on error to allow the route to continue
      return of(null);
    })
  );
};

