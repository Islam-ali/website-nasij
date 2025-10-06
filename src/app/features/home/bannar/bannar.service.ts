import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { GenericApiService } from '../../../core/services/generic-api.service';
import { BaseResponse } from '../../../core/models/baseResponse';
import { Banner } from '../../../interfaces/banner.interface';


@Injectable({
  providedIn: 'root'
})
export class BannarService {
  private apiUrl = `${environment.apiUrl}/banners`;
  private _genericApiService: GenericApiService<BaseResponse<Banner[]>>;

  constructor() {
    this._genericApiService = new GenericApiService<BaseResponse<Banner[]>>();
  }

  // Get all featured collections
  getBannar(activeOnly: boolean = true){
    const params = activeOnly ? { active: 'true' } : {};
    return this._genericApiService.Get(this.apiUrl, params);
  }

} 