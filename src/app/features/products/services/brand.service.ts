import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { GenericApiService } from '../../../core/services/generic-api.service';
import { CommonService } from '../../../core/services/common.service';
import { IBrand } from '../models/brand.interface';
import { BaseResponse, pagination } from '../../../core/models/baseResponse';
import { environment } from '../../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class BrandService {

  constructor(
    private _genericApiService: GenericApiService<any>,
    private commonService: CommonService
  ) {}

  // Get brands with pagination
  getBrands(queryParams?: any): Observable<BaseResponse<{brands: IBrand[], pagination: pagination}>> {
    return this._genericApiService.Get(environment.apiUrl + '/brands', queryParams);
  }

  // Get all brands without pagination
  listBrands(): Observable<BaseResponse<IBrand[]>> {
    return this._genericApiService.Get(`${environment.apiUrl}/brands/list`);
  }

  // Create a new brand
  createBrand(brand: IBrand): Observable<BaseResponse<IBrand>> {
    return this._genericApiService.Post(environment.apiUrl + '/brands', this.commonService.removeNullUndefinedEmptyStringKeys(brand));
  }

  // Update a brand
  updateBrand(id: string, brand: IBrand): Observable<BaseResponse<IBrand>> {
    return this._genericApiService.Patch(environment.apiUrl + '/brands', id, this.commonService.removeNullUndefinedEmptyStringKeys(brand));
  }

  // Delete a brand
  deleteBrand(id: string): Observable<BaseResponse<null>> {
    return this._genericApiService.Delete(environment.apiUrl + '/brands', id);
  }

  // Get brand by ID
  getBrandById(id: string, queryParams?: any): Observable<BaseResponse<IBrand>> {
    return this._genericApiService.Get(`${environment.apiUrl}/brands/${id}`, queryParams);
  }
}
