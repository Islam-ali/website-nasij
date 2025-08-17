import { Injectable } from '@angular/core';
import { environment } from '../../../../environments/environment.development';
import { GenericApiService } from '../../../core/services/generic-api.service';
import { BaseResponse } from '../../../core/models/baseResponse';
import { Feature } from '../../../interfaces/feature.interface';


@Injectable({
  providedIn: 'root'
})
export class FeatureService {
  private apiUrl = `${environment.apiUrl}/features`;
  private _genericApiService: GenericApiService<BaseResponse<Feature[]>>;

  constructor() {
    this._genericApiService = new GenericApiService<BaseResponse<Feature[]>>();
  }

  // Get all featured collections
  getFeature(){
    const params = { active: 'true' };
    return this._genericApiService.Get(this.apiUrl, params);
  }

} 