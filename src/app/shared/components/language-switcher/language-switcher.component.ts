import { Component, OnInit, Inject, PLATFORM_ID } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { DropdownModule } from 'primeng/dropdown';
import { FormsModule } from '@angular/forms';
import { TranslationService } from '../../../core/services/translate.service';
import { TranslateModule } from '@ngx-translate/core';
import { timeout } from 'rxjs';

interface LanguageOption {
  label: string;
  value: string;
}

@Component({
  selector: 'app-language-switcher',
  standalone: true,
  imports: [CommonModule, DropdownModule, FormsModule, TranslateModule],
  template: `
    <div class="language-switcher">
      <p-dropdown
        [options]="languageOptions"
        [(ngModel)]="selectedLanguage"
        (onChange)="onLanguageChange($event)"
        [placeholder]="'common.language' | translate"
        [showClear]="false"
        [style]="{ 'width': '80px' }"
        [appendTo]="'body'"
        [panelStyle]="{ 'width': '80px' }"
      >
        <ng-template pTemplate="selectedItem">
          <div class="flex items-center gap-2">
            <span class="text-sm font-medium">{{ getCurrentLanguageDisplay() }}</span>
          </div>
        </ng-template>
        <ng-template let-option pTemplate="item">
          <div class="flex items-center gap-2 p-2">
            <span class="text-sm">{{ option.label }}</span>
          </div>
        </ng-template>
      </p-dropdown>
    </div>
  `,
  styles: [`
    .language-switcher {
      display: flex;
      align-items: center;
    }
    
    :host ::ng-deep .p-dropdown {
      border-radius: 0.375rem;
    }
    
    :host ::ng-deep .p-dropdown:not(.p-disabled):hover {
      border-color: #3b82f6;
    }
    
    :host ::ng-deep .p-dropdown:not(.p-disabled).p-focus {
      border-color: #3b82f6;
      box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
    }
    
    :host ::ng-deep .p-dropdown-panel {
      border: 1px solid #e5e7eb;
      border-radius: 0.375rem;
      box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
    }
    
    :host ::ng-deep .p-dropdown-item:hover {
      background-color: #f3f4f6;
    }
    
    :host ::ng-deep .p-dropdown-item.p-highlight {
      background-color: #3b82f6;
      color: white;
    }
  `]
})
export class LanguageSwitcherComponent implements OnInit {
  selectedLanguage: string = 'en';
  languageOptions: LanguageOption[] = [];

  constructor(
    private translationService: TranslationService,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {}

  ngOnInit(): void {
    if (isPlatformBrowser(this.platformId)) {
      this.translationService.initBrowserFeatures();
      setTimeout(() => {
        this.selectedLanguage = this.translationService.getCurrentLanguage();
        this.initializeLanguageOptions();
      }, 200);
    }
  }

  private initializeLanguageOptions(): void {
    const supportedLanguages = this.translationService.getSupportedLanguages();
    this.languageOptions = supportedLanguages.map(lang => ({
      label: this.translationService.getLanguageDisplayName(lang),
      value: lang
    }));
  }

  onLanguageChange(event: any): void {
    if (event.value) {
      this.translationService.setLanguage(event.value);
    }
  }

  getCurrentLanguageDisplay(): string {
    return this.translationService.getLanguageDisplayName(this.selectedLanguage);
  }
}