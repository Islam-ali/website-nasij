import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { BaseResponse } from '../core/models/baseResponse';
import { IMenuLink, IDropdownItem, DropdownConfig } from '../interfaces/menu-link.interface';
import { environment } from '../../environments/environment';
import { TranslationService } from '../core/services/translate.service';

@Injectable({
  providedIn: 'root'
})
export class MenuLinkService {
  private apiUrl = `${environment.apiUrl}/menu-links`;

  constructor(
    private http: HttpClient,
    private translationService: TranslationService
  ) {}

  getActiveMenuLinks(): Observable<IMenuLink[]> {
    return this.http.get<BaseResponse<IMenuLink[]>>(`${this.apiUrl}/active`).pipe(
      map(response => response.data)
    );
  }

  fetchDropdownItems(config: DropdownConfig): Observable<IDropdownItem[]> {
    const url = config.apiUrl.startsWith('http') 
      ? config.apiUrl 
      : `${environment.apiUrl}${config.apiUrl}`;

    const request = config.method === 'POST' 
      ? this.http.post(url, {})
      : this.http.get(url);

    return request.pipe(
      map((response: any) => {
        const data = response.data || response;
        const items = Array.isArray(data) ? data : (data.items || data.list || []);
        
        return items.map((item: any) => {
          const value = item[config.valueField];          
          // Get label field names from config
          const labelFieldEn = config['labelField'].ar;
          const labelFieldAr = config['labelField'].en;
          
          const labelEn = item[labelFieldEn].en;
          const labelAr = item[labelFieldAr].ar;
          
          // Replace placeholder in URL template
          let url = config.urlTemplate;
          url = this.buildUrl(url, item);
          return {
            value,
            label: {
              en: labelEn,
              ar: labelAr
            },
            url
          };
        });
      })
    );
  }
  buildUrl(template: string, params: any) {
    const url = template.replace(/\{([^}]+)\}/g, (_, key) => {
      return key.split('.').reduce((acc: any, part: string) => acc?.[part] ?? '', params) ?? '';
    });

    return decodeURIComponent(url)
  }
}

