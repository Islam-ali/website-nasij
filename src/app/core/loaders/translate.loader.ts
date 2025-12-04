// src/app/core/loaders/translate.loader.ts
import { HttpClient } from '@angular/common/http';
import { Inject, PLATFORM_ID } from '@angular/core';
import { TranslateLoader } from '@ngx-translate/core';
import { Observable, of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { isPlatformBrowser } from '@angular/common';

export class UniversalTranslateLoader implements TranslateLoader {
  constructor(
    private http: HttpClient,
    @Inject(PLATFORM_ID) private platformId: Object,
    private prefix: string = '/assets/i18n/',
    private suffix: string = '.json'
  ) {}

  getTranslation(lang: string): Observable<any> {
    let url = '';

    if (isPlatformBrowser(this.platformId)) {
      // Browser: relative URL
      url = `${this.prefix}${lang}${this.suffix}`;
    } else {
      // Server: full URL (HTTP fetch from same server)
      const baseUrl = process.env['BASE_URL'] || 'http://localhost:4000';
      url = `${baseUrl}${this.prefix}${lang}${this.suffix}`;
    }

    return this.http.get(url).pipe(
      catchError(err => {
        console.warn(`Could not load translation for '${lang}' from '${url}'. Using empty object.`);
        return of({});
      })
    );
  }
}

// Factory function for TranslateModule
export function translateLoaderFactory(http: HttpClient, platformId: Object): TranslateLoader {
  return new UniversalTranslateLoader(http, platformId);
}
