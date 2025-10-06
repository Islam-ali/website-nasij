import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { GenericApiService } from '../../../core/services/generic-api.service';
import { BaseResponse } from '../../../core/models/baseResponse';
import { IFeaturedCollection } from '../../../interfaces/featured-collection';


@Injectable({
  providedIn: 'root'
})
export class FeaturedCollectionsService {
  private apiUrl = `${environment.apiUrl}/featured-collections`;
  private _genericApiService: GenericApiService<BaseResponse<IFeaturedCollection[]>>;

  constructor() {
    this._genericApiService = new GenericApiService<BaseResponse<IFeaturedCollection[]>>();
  }

  // Get all featured collections
  getFeaturedCollections(activeOnly: boolean = true): Observable<BaseResponse<IFeaturedCollection[]>> {
    const params = activeOnly ? { active: 'true' } : {};
    return this._genericApiService.Get(this.apiUrl, params);
  }

} 