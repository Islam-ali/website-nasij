import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { BaseResponse } from '../core/models/baseResponse';
import { IReview } from '../interfaces/review.interface';

@Injectable({
  providedIn: 'root'
})
export class ReviewService {
  private apiUrl = `${environment.apiUrl}/reviews`;

  constructor(private http: HttpClient) {}

  // Get all active reviews
  getActiveReviews(): Observable<BaseResponse<IReview[]>> {
    return this.http.get<BaseResponse<IReview[]>>(`${this.apiUrl}/active`);
  }

  // Get pinned reviews
  getPinnedReviews(): Observable<BaseResponse<IReview[]>> {
    return this.http.get<BaseResponse<IReview[]>>(`${this.apiUrl}/pinned`);
  }

  // Get reviews with optional filters
  getReviews(queryParams?: any): Observable<BaseResponse<IReview[]>> {
    return this.http.get<BaseResponse<IReview[]>>(this.apiUrl, { params: queryParams });
  }
}

