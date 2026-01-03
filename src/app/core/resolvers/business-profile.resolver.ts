import { inject } from '@angular/core';
import { ResolveFn } from '@angular/router';
import { Observable, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { BusinessProfileService } from '../../services/business-profile.service';
import { BaseResponse } from '../models/baseResponse';
import { IBusinessProfile } from '../../interfaces/business-profile.interface';

export const businessProfileResolver: ResolveFn<IBusinessProfile | null> = (): Observable<IBusinessProfile | null> => {
  const businessProfileService = inject(BusinessProfileService);

  return businessProfileService.getLatestBusinessProfile().pipe(
    map((response: BaseResponse<IBusinessProfile>) => {
      if (response.success && response.data) {
        // Set the business profile in the service for other components to use
        businessProfileService.setBusinessProfile(response.data);
        return response.data;
      }
      return null;
    }),
    catchError((error) => {
      console.error('Error resolving business profile:', error);
      // Return null on error to allow the route to continue
      return of(null);
    })
  );
};

