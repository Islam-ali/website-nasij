import { ApplicationConfig, importProvidersFrom, provideZoneChangeDetection, PLATFORM_ID } from '@angular/core';
import { HttpClient, provideHttpClient, withFetch } from '@angular/common/http';
import { provideRouter, withInMemoryScrolling, withComponentInputBinding, withViewTransitions } from '@angular/router';
import { routes } from './app.routes';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { TranslateModule, TranslateLoader } from '@ngx-translate/core';
import { translateLoaderFactory, UniversalTranslateLoader } from './core/loaders/translate.loader';

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }),

    provideRouter(
      routes,
      withInMemoryScrolling({
        scrollPositionRestoration: 'top',
        anchorScrolling: 'enabled'
      }),
      withViewTransitions(),
      withComponentInputBinding()
    ),

    provideHttpClient(withFetch()),
    provideAnimationsAsync(),

    importProvidersFrom(
      TranslateModule.forRoot({
        loader: {
          provide: TranslateLoader,
          useFactory: (http: HttpClient, platformId: Object) =>
            new UniversalTranslateLoader(http, platformId, '/i18n/', '.json'),
          deps: [HttpClient, PLATFORM_ID]
          
        },
        defaultLanguage: 'ar'
      })
    )
  ]
};
