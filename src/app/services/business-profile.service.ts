import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { BaseResponse } from '../core/models/baseResponse';
import { IBusinessProfile } from '../interfaces/business-profile.interface';

@Injectable({
  providedIn: 'root'
})
export class BusinessProfileService {
  private apiUrl = `${environment.apiUrl}/business-profile`;

  businessProfile: BehaviorSubject<IBusinessProfile | null> = new BehaviorSubject<IBusinessProfile | null>(null);
  constructor(private http: HttpClient) {}

  getLatestBusinessProfile(): Observable<BaseResponse<IBusinessProfile>> {
    return this.http.get<BaseResponse<IBusinessProfile>>(`${this.apiUrl}/latest`);
  }

  getBusinessProfile$(): Observable<IBusinessProfile | null> {
    return this.businessProfile.asObservable();
  }

  setBusinessProfile(businessProfile: IBusinessProfile | null) {
    this.businessProfile.next(businessProfile);
  }

} 