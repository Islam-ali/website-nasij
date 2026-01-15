import { inject, PLATFORM_ID } from '@angular/core';
import { ResolveFn } from '@angular/router';
import { Observable, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { BusinessProfileService } from '../../services/business-profile.service';
import { SeoService } from '../services/seo.service';
import { BaseResponse } from '../models/baseResponse';
import { IBusinessProfile } from '../../interfaces/business-profile.interface';
import { isPlatformBrowser } from '@angular/common';

export const businessProfileResolver: ResolveFn<IBusinessProfile | null> = (): Observable<IBusinessProfile | null> => {
  const businessProfileService = inject(BusinessProfileService);
  const seoService = inject(SeoService);
  const platformId = inject(PLATFORM_ID);

  // Check if business profile is already loaded
  const currentProfile = businessProfileService.businessProfile.value;
  if (currentProfile) {
    // Already loaded, return it immediately
    return of(currentProfile);
  }

  return businessProfileService.getLatestBusinessProfile().pipe(
    map((response: BaseResponse<IBusinessProfile>) => {
      // TransformInterceptor wraps the response, so it should always be BaseResponse format
      if (response && typeof response === 'object' && 'success' in response && 'data' in response) {
        // Check if response is successful and has data
        if (response.success && response.data !== null && response.data !== undefined) {
          // Set the business profile in the service for other components to use
          businessProfileService.setBusinessProfile(response.data);
          
          // Apply SEO settings from business profile
          if (isPlatformBrowser(platformId)) {
            setTimeout(() => {
              seoService.applyBusinessProfileSeo(response.data);
            }, 100);
          }
          
          return response.data;
        } else {
          // Response is successful but data is null - no business profile exists
          return null;
        }
      }
      
      // Invalid response format
      return null;
    }),
    catchError((error) => {
      // Return null on error to allow the route to continue
      return of(null);
    })
  );
};

