import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { BaseResponse } from '../../../core/models/baseResponse';

export interface Timeline {
  _id: string;
  name: {
    en: string;
    ar: string;
  };
  dateTime: Date | string;
  icon: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface OrderTimelineEntry {
  _id: string;
  timelineId: Timeline;
  note?: string;
  dateTime: Date | string;
  timeline: Timeline;
}

export interface OrderWithTimelines {
  orderId: string;
  orderNumber: string;
  timelines: OrderTimelineEntry[];
}

@Injectable({
  providedIn: 'root'
})
export class TimelineService {
  private apiUrl = `${environment.apiUrl}`;

  constructor(private http: HttpClient) {}

  getOrderTimelines(orderId: string): Observable<BaseResponse<OrderWithTimelines>> {
    return this.http.get<BaseResponse<OrderWithTimelines>>(`${this.apiUrl}/orders/${orderId}/timelines`);
  }
}