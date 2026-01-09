import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { GenericApiService } from '../../../core/services/generic-api.service';
import { BaseResponse } from '../../../core/models/baseResponse';

export interface IHeroLayoutItem {
  title: { en: string; ar: string };
  description: { en: string; ar: string };
  image: {
    filePath: string;
    fileName: string;
    fileSize: number;
    uploadDate: Date;
  };
  buttonText: { en: string; ar: string };
  buttonLink: string;
  queryParams?: any;
}

export interface IProfessionalGridConfig {
  columns?: {
    base?: number;
    md?: number;
    lg?: number;
    xl?: number;
  };
  rows?: {
    base?: number;
    md?: number;
    lg?: number;
    xl?: number;
  };
  rowHeight?: {
    base?: string;
    md?: string;
    lg?: string;
    xl?: string;
  };
  gap?: number;
  items?: Array<{
    colSpan?: {
      base?: number;
      md?: number;
      lg?: number;
      xl?: number;
    };
    rowSpan?: {
      base?: number;
      md?: number;
      lg?: number;
      xl?: number;
    };
    customClass?: string;
  }>;
  wrapperClass?: string;
  justifyContent?: string;
  alignItems?: string;
}

export interface IHeroLayout {
  _id?: string;
  name: string;
  sectionTitle?: { en: string; ar: string };
  sectionSubtitle?: { en: string; ar: string };
  description?: { en: string; ar: string };
  items: IHeroLayoutItem[];
  gridConfig: IProfessionalGridConfig;
  isActive: boolean;
  displayOrder: number;
  tags?: string[];
  createdAt?: Date;
  updatedAt?: Date;
}

@Injectable({
  providedIn: 'root'
})
export class HeroLayoutService {
  private apiUrl = `${environment.apiUrl}/hero-layouts`;
  private _genericApiService: GenericApiService<BaseResponse<IHeroLayout[]>>;

  constructor() {
    this._genericApiService = new GenericApiService<BaseResponse<IHeroLayout[]>>();
  }

  // Get all active hero layouts
  getActiveHeroLayouts(): Observable<BaseResponse<IHeroLayout[]>> {
    const params = { active: 'true' };
    return this._genericApiService.Get(this.apiUrl, params);
  }

  // Get hero layout by name
  getHeroLayoutByName(name: string): Observable<BaseResponse<IHeroLayout[]>> {
    return this._genericApiService.Get(`${this.apiUrl}/by-name/${name}`);
  }
}

