import { Pipe, PipeTransform } from '@angular/core';
import { MultilingualText } from '../models/multi-language';
import { TranslationService } from '../services/translate.service';

@Pipe({
  name: 'multiLanguage',
  standalone: true,
  pure: false
  })
export class MultiLanguagePipe implements PipeTransform {

  constructor(private translationService: TranslationService) {
  }

  transform(value: MultilingualText, ...args: unknown[]): unknown {
     return value[this.translationService.getCurrentLanguage() as keyof MultilingualText] || value.en || '';
    }

}
