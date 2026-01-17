import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { HeroLayoutService, IHeroLayout } from './hero-layout.service';
import { TranslationService } from '../../../core/services/translate.service';
import { MultiLanguagePipe } from '../../../core/pipes/multi-language.pipe';
import { FallbackImgDirective } from '../../../core/directives/fallback-img.directive';
import { TranslateModule } from '@ngx-translate/core';
import { environment } from '../../../../environments/environment';

@Component({
  selector: 'app-hero-layouts',
  standalone: true,
  imports: [CommonModule, MultiLanguagePipe, FallbackImgDirective, TranslateModule],
  template: `
    <div class="min-h-screen bg-gradient-to-br from-gray-50 to-white dark:from-gray-900 dark:to-gray-800">
      <!-- Header -->
      <div class="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
        <div class="max-w-[1440px] mx-auto px-4 py-8">
          <div class="text-center mb-8">
            <span class="inline-flex items-center px-4 py-2 rounded-full text-sm font-medium bg-primary-500 text-white mb-4">
              <i class="pi pi-star-fill me-2" aria-hidden="true"></i>
              {{ 'heroLayouts.title' | translate }}
            </span>
            <h1 class="text-4xl lg:text-5xl font-bold text-gray-900 dark:text-white mt-2 mb-4">
              <span class="bg-gradient-to-r from-primary-600 to-primary-800 dark:from-primary-400 dark:to-primary-600 bg-clip-text text-transparent">
                {{ 'heroLayouts.subtitle' | translate }}
              </span>
            </h1>
            <p class="text-gray-700 dark:text-gray-300 text-lg max-w-2xl mx-auto">
              {{ 'heroLayouts.description' | translate }}
            </p>
            <div class="mt-4">
              <span class="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-orange-500 text-white">
                <i class="pi pi-wrench me-2" aria-hidden="true"></i>
                {{ 'common.beta' | translate }}
              </span>
            </div>
          </div>
        </div>
      </div>

      <!-- Hero Layouts Grid -->
      <div class="max-w-[1440px] mx-auto px-4 py-12">
        @if (loading) {
          <!-- Loading Skeleton -->
          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            @for (i of [1,2,3,4,5,6]; track i) {
              <div class="bg-white dark:bg-gray-800 rounded-2xl shadow-lg overflow-hidden animate-pulse">
                <div class="h-64 bg-gray-300 dark:bg-gray-700"></div>
                <div class="p-6">
                  <div class="h-6 bg-gray-300 dark:bg-gray-700 rounded mb-3"></div>
                  <div class="h-4 bg-gray-300 dark:bg-gray-700 rounded mb-2"></div>
                  <div class="h-4 bg-gray-300 dark:bg-gray-700 rounded w-3/4"></div>
                </div>
              </div>
            }
          </div>
        } @else if (heroLayouts.length === 0) {
          <!-- No layouts available -->
          <div class="text-center py-16">
            <div class="w-24 h-24 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-6">
              <i class="pi pi-image text-4xl text-gray-400 dark:text-gray-500" aria-hidden="true"></i>
            </div>
            <h3 class="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              {{ 'heroLayouts.noLayouts' | translate }}
            </h3>
            <p class="text-gray-600 dark:text-gray-400">
              {{ 'heroLayouts.comingSoon' | translate }}
            </p>
          </div>
        } @else {
          <!-- Hero Layouts Grid -->
          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            @for (layout of heroLayouts; track layout._id) {
              <div class="bg-white dark:bg-gray-800 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden group cursor-pointer"
                   (click)="viewLayout(layout)">
                <!-- Layout Preview -->
                <div class="relative h-64 overflow-hidden">
                  @if (layout.items && layout.items.length > 0) {
                    <!-- Show first item as preview -->
                    <div class="relative w-full h-full">
                      @if (layout.items[0].image?.filePath) {
                        <img [src]="domain + layout.items[0].image.filePath"
                             [alt]="layout.items[0].title | multiLanguage"
                             fallback
                             class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300">
                      } @else {
                        <div class="w-full h-full bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center">
                          <i class="pi pi-image text-white text-4xl" aria-hidden="true"></i>
                        </div>
                      }
                    </div>
                  } @else {
                    <div class="w-full h-full bg-gradient-to-br from-gray-300 to-gray-400 dark:from-gray-600 dark:to-gray-700 flex items-center justify-center">
                      <i class="pi pi-image text-gray-500 dark:text-gray-400 text-4xl" aria-hidden="true"></i>
                    </div>
                  }

                  <!-- Overlay with layout info -->
                  <div class="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end">
                    <div class="p-4 text-white w-full">
                      <p class="text-sm font-medium mb-1">{{ 'heroLayouts.items' | translate }}: {{ layout.items?.length || 0 }}</p>
                      <p class="text-xs opacity-90">{{ layout.description | multiLanguage }}</p>
                    </div>
                  </div>
                </div>

                <!-- Layout Info -->
                <div class="p-6">
                  <h3 class="text-xl font-bold text-gray-900 dark:text-white mb-2">
                    {{ layout.name | multiLanguage }}
                  </h3>
                  <p class="text-gray-600 dark:text-gray-400 text-sm mb-4 line-clamp-2">
                    {{ layout.description | multiLanguage }}
                  </p>

                  <!-- Layout Stats -->
                  <div class="flex items-center justify-between text-sm text-gray-500 dark:text-gray-400">
                    <span>{{ 'heroLayouts.created' | translate }}</span>
                    <span>{{ layout.createdAt | date:'short' }}</span>
                  </div>

                  <!-- Action Button -->
                  <button class="w-full mt-4 px-4 py-2 bg-primary-500 hover:bg-primary-600 text-white rounded-lg font-medium transition-colors duration-300">
                    {{ 'heroLayouts.viewLayout' | translate }}
                  </button>
                </div>
              </div>
            }
          </div>
        }
      </div>
    </div>
  `,
  styles: [`
    .line-clamp-2 {
      display: -webkit-box;
      -webkit-line-clamp: 2;
      -webkit-box-orient: vertical;
      overflow: hidden;
    }
  `]
})
export class HeroLayoutsComponent implements OnInit {
  domain = environment.domain + '/';
  heroLayouts: IHeroLayout[] = [];
  loading = true;

  constructor(
    private heroLayoutService: HeroLayoutService,
    private router: Router,
    private translationService: TranslationService
  ) {}

  ngOnInit(): void {
    this.loadHeroLayouts();
  }

  loadHeroLayouts(): void {
    this.heroLayoutService.getActiveHeroLayouts().subscribe({
      next: (response) => {
        this.heroLayouts = response.data || [];
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading hero layouts:', error);
        this.loading = false;
      }
    });
  }

  viewLayout(layout: IHeroLayout): void {
    // For now, just navigate back to home since hero-layouts are displayed there
    // In the future, this could navigate to a detailed view
    this.router.navigate(['/'], {
      fragment: 'hero-layouts',
      queryParams: { layout: layout.name }
    });
  }
}