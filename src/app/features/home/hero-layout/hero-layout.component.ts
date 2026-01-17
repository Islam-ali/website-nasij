import { Component, OnInit, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { HeroLayoutService, IHeroLayout, IProfessionalGridConfig } from './hero-layout.service';
import { TranslationService } from '../../../core/services/translate.service';
import { MultiLanguagePipe } from '../../../core/pipes/multi-language.pipe';
import { FallbackImgDirective } from '../../../core/directives/fallback-img.directive';
import { environment } from '../../../../environments/environment';

@Component({
  selector: 'app-hero-layout',
  standalone: true,
  imports: [CommonModule, MultiLanguagePipe, FallbackImgDirective],
  templateUrl: './hero-layout.component.html',
  styleUrls: ['./hero-layout.component.scss']
})
export class HeroLayoutComponent implements OnInit {
  @Input() layoutName?: string; // Optional: load specific layout by name
  @Input() heroLayout?: IHeroLayout; // Optional: pass layout data directly
  domain = environment.domain + '/';
  heroLayouts: IHeroLayout[] = [];
  loading = true;

  constructor(
    private heroLayoutService: HeroLayoutService,
    private router: Router,
    private translationService: TranslationService
  ) {}

  ngOnInit(): void {
    if (this.heroLayout) {
      // Use provided layout data
      this.heroLayouts = [this.heroLayout];
      this.loading = false;
    } else if (this.layoutName) {
      // Load specific layout by name
      this.loadLayoutByName(this.layoutName);
    } else {
      // Load all active layouts
      this.loadActiveLayouts();
    }
  }

  loadActiveLayouts(): void {
    this.heroLayoutService.getActiveHeroLayouts().subscribe({
      next: (response) => {
        this.heroLayouts = response.data || [];
        this.loading = false;
      },
      error: (error) => {
        this.loading = false;
      }
    });
  }

  loadLayoutByName(name: string): void {
    this.heroLayoutService.getHeroLayoutByName(name).subscribe({
      next: (response: any) => {
        this.heroLayouts = response.data ? [response.data] : [];
        this.loading = false;
      },
      error: (error) => {
        this.loading = false;
      }
    });
  }

  onButtonClick(link: string): void {
    if (link) {
      this.router.navigate([link]);
    }
  }

  toggleVideoPlay(videoElement: HTMLVideoElement): void {
    if (videoElement.paused) {
      videoElement.play();
    } else {
      videoElement.pause();
    }
  }

  // Grid utility methods
  getGridContainerClasses(config?: IProfessionalGridConfig): string {
    if (!config) return '';
    
    const classes: string[] = [];
    
    if (config.columns) {
      if (config.columns.base) classes.push(`grid-cols-${config.columns.base}`);
      if (config.columns.md) classes.push(`md:grid-cols-${config.columns.md}`);
      if (config.columns.lg) classes.push(`lg:grid-cols-${config.columns.lg}`);
      if (config.columns.xl) classes.push(`xl:grid-cols-${config.columns.xl}`);
    }

    if (config.gap !== undefined) {
      const gapClass = Math.round(config.gap / 4);
      classes.push(`gap-${gapClass}`);
    }

    // Layout container classes
    if (config.maxWidth && config.maxWidth !== 'none') {
      // Remove default max-width and apply custom one via styles instead
      // This will be handled in getGridContainerStyles
    }

    if (config.justifyContent) {
      const justifyMap: { [key: string]: string } = {
        'center': 'justify-items-center',
        'start': 'justify-items-start',
        'end': 'justify-items-end',
        'between': 'justify-between',
        'around': 'justify-around',
        'evenly': 'justify-evenly'
      };
      if (justifyMap[config.justifyContent]) {
        classes.push(justifyMap[config.justifyContent]);
      }
    }

    if (config.alignItems) {
      const alignMap: { [key: string]: string } = {
        'center': 'items-center',
        'start': 'items-start',
        'end': 'items-end',
        'stretch': 'items-stretch'
      };
      if (alignMap[config.alignItems]) {
        classes.push(alignMap[config.alignItems]);
      }
    }

    return classes.join(' ');
  }

  getGridContainerStyles(config?: IProfessionalGridConfig): any {
    if (!config) return {};

    const styles: any = {};

    if (config.rows) {
      const rows = config.rows.lg || config.rows.md || config.rows.base;
      if (rows) {
        const rowHeight = config.rowHeight?.lg || config.rowHeight?.md || config.rowHeight?.base || 'auto';
        styles['grid-template-rows'] = `repeat(${rows}, ${rowHeight})`;
      }
    } else if (config.rowHeight) {
      const rowHeight = config.rowHeight.lg || config.rowHeight.md || config.rowHeight.base;
      if (rowHeight) {
        styles['grid-auto-rows'] = rowHeight;
      }
    }

    // Layout options
    if (config.maxWidth) {
      styles['max-width'] = config.maxWidth;
    }

    if (config.justifyContent) {
      styles['justify-content'] = config.justifyContent;
    }

    if (config.alignItems) {
      styles['align-items'] = config.alignItems;
    }

    return styles;
  }

  getItemClasses(config: IProfessionalGridConfig | undefined, index: number): string {
    if (!config) return '';
    
    const classes: string[] = [];
    const item = config.items?.[index];

    if (item) {
      if (item.colSpan) {
        if (item.colSpan.base) classes.push(`col-span-${item.colSpan.base}`);
        if (item.colSpan.md) classes.push(`md:col-span-${item.colSpan.md}`);
        if (item.colSpan.lg) classes.push(`lg:col-span-${item.colSpan.lg}`);
        if (item.colSpan.xl) classes.push(`xl:col-span-${item.colSpan.xl}`);
      }

      if (item.rowSpan) {
        if (item.rowSpan.base) classes.push(`row-span-${item.rowSpan.base}`);
        if (item.rowSpan.md) classes.push(`md:row-span-${item.rowSpan.md}`);
        if (item.rowSpan.lg) classes.push(`lg:row-span-${item.rowSpan.lg}`);
        if (item.rowSpan.xl) classes.push(`xl:row-span-${item.rowSpan.xl}`);
      }

      if (item.customClass) {
        classes.push(item.customClass);
      }
    }

    return classes.join(' ');
  }
}


