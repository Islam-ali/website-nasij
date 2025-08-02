import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { GenericApiService } from '../../../core/services/generic-api.service';
import { CommonService } from '../../../core/services/common.service';
import { BaseResponse, pagination } from '../../../core/models/baseResponse';
import { ICategory } from '../models/category.interface';
import { environment } from '../../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class CategoryService {

  constructor(
    private _genericApiService: GenericApiService<any>,
    private commonService: CommonService) {}

  // Get all categories
  getCategories(queryParams?: any): Observable<BaseResponse<{categories:ICategory[], pagination:pagination}>> {
    return this._genericApiService.Get(environment.apiUrl + '/categories', queryParams);
  }

  // get list categories
  listCategories(): Observable<BaseResponse<ICategory[]>> {
    return this._genericApiService.Get(`${environment.apiUrl}/categories/list`);
  }

  // Create a new category
  createCategory(category: ICategory): Observable<BaseResponse<ICategory>> {
    return this._genericApiService.Post(environment.apiUrl + '/categories', this.commonService.removeNullUndefinedEmptyStringKeys(category));
  }

  // Update a category
  updateCategory(id: string, category: ICategory): Observable<BaseResponse<ICategory>> {
    return this._genericApiService.Patch(environment.apiUrl + '/categories', id, this.commonService.removeNullUndefinedEmptyStringKeys(category));
  }

  // Delete a category
  deleteCategory(id: string): Observable<BaseResponse<any>> {
    return this._genericApiService.Delete(environment.apiUrl + '/categories', id);
  }

  // Get category by ID
  getCategoryById(id: string, queryParams?: any): Observable<BaseResponse<ICategory>> {
    return this._genericApiService.Get(`${environment.apiUrl}/categories/${id}`, queryParams);
  }
}
