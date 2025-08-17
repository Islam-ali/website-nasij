import { Injectable } from '@angular/core';
import { GenericApiService } from '../../../core/services/generic-api.service';
import { CommonService } from '../../../core/services/common.service';
import { environment } from '../../../../environments/environment';
import { HeroSection } from './hero-section';
import { Observable } from 'rxjs';
import { BaseResponse, pagination } from '../../../core/models/baseResponse';

@Injectable({
  providedIn: 'root'
})
export class HeroSectionService {

  constructor(
    private genericApiService: GenericApiService<any>,
    private commonService: CommonService
  ) { }

  getHeroesActive() : Observable<BaseResponse<HeroSection[]>> {
    return this.genericApiService.Get(`${environment.apiUrl}/hero/active`);
  }
}
