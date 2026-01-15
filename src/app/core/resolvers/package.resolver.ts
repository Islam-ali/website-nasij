import { inject } from '@angular/core';
import { ResolveFn, ActivatedRouteSnapshot } from '@angular/router';
import { Observable, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { PackageService } from '../../features/packages/services/package.service';
import { BaseResponse } from '../models/baseResponse';
import { IPackage } from '../../interfaces/package.interface';

export const packageResolver: ResolveFn<IPackage | null> = (route: ActivatedRouteSnapshot): Observable<IPackage | null> => {
  const packageService = inject(PackageService);
  const packageId = route.paramMap.get('id');

  if (!packageId) {
    return of(null);
  }

  return packageService.getPackage(packageId).pipe(
    map((response: BaseResponse<IPackage>) => {
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

