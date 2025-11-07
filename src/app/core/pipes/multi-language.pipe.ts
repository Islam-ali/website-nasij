import { Pipe, PipeTransform, OnDestroy, PLATFORM_ID, Inject } from '@angular/core';
import { MultilingualText } from '../models/multi-language';
import { Subject } from 'rxjs';
import { isPlatformBrowser } from '@angular/common';

@Pipe({
  name: 'multiLanguage',
  standalone: true,
  pure: false
  })
export class MultiLanguagePipe implements PipeTransform, OnDestroy {
  private destroy$ = new Subject<void>();

  constructor(@Inject(PLATFORM_ID) private platformId: Object) {
  }

  transform(value: MultilingualText | null | undefined): string {
    if (!value) return '';
    // platform browser
    if (isPlatformBrowser(this.platformId)) {
      const currentLang = localStorage.getItem('pledge-language') || 'ar';
      return value[currentLang as keyof MultilingualText] || value.ar || '';
    }
    return value.ar || '';
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
