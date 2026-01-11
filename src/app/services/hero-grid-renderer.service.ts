import { Injectable } from '@angular/core';
import { IProfessionalGridConfig, Responsive } from '../interfaces/professional-grid.interface';

/**
 * Professional Hero Grid Renderer Service
 * Converts grid configuration to Tailwind CSS classes and inline styles
 */
@Injectable({
  providedIn: 'root'
})
export class HeroGridRendererService {

  constructor() { }

  /**
   * Generate grid container classes from config
   */
  getGridContainerClasses(config: IProfessionalGridConfig): string[] {
    const classes: string[] = ['grid']; // Always use grid display

    // Add columns classes
    if (config.columns) {
      const colClasses = this.generateResponsiveClasses('grid-cols', config.columns);
      classes.push(...colClasses);
    }

    // Add rows classes (optional)
    if (config.rows) {
      const rowClasses = this.generateResponsiveClasses('grid-rows', config.rows);
      classes.push(...rowClasses);
    }

    // Add gap class
    if (config.gap !== undefined && config.gap !== null) {
      classes.push(this.convertGapToTailwind(config.gap));
    }

    // Add justify-content
    if (config.justifyContent) {
      classes.push(this.getJustifyClass(config.justifyContent));
    }

    // Add align-items
    if (config.alignItems) {
      classes.push(this.getAlignClass(config.alignItems));
    }

    // Add wrapper class if provided
    if (config.wrapperClass) {
      classes.push(config.wrapperClass);
    }

    return classes;
  }

  /**
   * Generate grid container inline styles
   */
  getGridContainerStyles(config: IProfessionalGridConfig): { [key: string]: string } {
    const styles: { [key: string]: string } = {};

    // Add responsive row height using CSS custom properties
    if (config.rowHeight) {
      // Base (mobile)
      if (config.rowHeight.base) {
        styles['--row-height-base'] = config.rowHeight.base;
        styles['grid-auto-rows'] = config.rowHeight.base; // Default
      }
      // MD
      if (config.rowHeight.md) {
        styles['--row-height-md'] = config.rowHeight.md;
      }
      // LG
      if (config.rowHeight.lg) {
        styles['--row-height-lg'] = config.rowHeight.lg;
      }
      // XL
      if (config.rowHeight.xl) {
        styles['--row-height-xl'] = config.rowHeight.xl;
      }
    }

    return styles;
  }

  /**
   * Generate item classes for a specific collection item
   */
  getItemClasses(config: IProfessionalGridConfig, itemIndex: number): string[] {
    const classes: string[] = [];

    if (!config.items || !config.items[itemIndex]) {
      return classes;
    }

    const itemConfig = config.items[itemIndex];

    // Add col-span classes
    if (itemConfig.colSpan) {
      const colSpanClasses = this.generateResponsiveClasses('col-span', itemConfig.colSpan);
      classes.push(...colSpanClasses);
    }

    // Add row-span classes
    if (itemConfig.rowSpan) {
      const rowSpanClasses = this.generateResponsiveClasses('row-span', itemConfig.rowSpan);
      classes.push(...rowSpanClasses);
    }

    // Add custom class
    if (itemConfig.customClass) {
      classes.push(itemConfig.customClass);
    }

    return classes;
  }

  /**
   * Generate responsive Tailwind classes from Responsive<number>
   * Example: { base: 1, lg: 2 } => ['grid-cols-1', 'lg:grid-cols-2']
   */
  private generateResponsiveClasses(prefix: string, responsive: Responsive<number>): string[] {
    const classes: string[] = [];

    // Base (mobile-first, no prefix)
    if (responsive.base !== undefined && responsive.base !== null) {
      classes.push(`${prefix}-${responsive.base}`);
    }

    // MD
    if (responsive.md !== undefined && responsive.md !== null) {
      classes.push(`md:${prefix}-${responsive.md}`);
    }

    // LG
    if (responsive.lg !== undefined && responsive.lg !== null) {
      classes.push(`lg:${prefix}-${responsive.lg}`);
    }

    // XL
    if (responsive.xl !== undefined && responsive.xl !== null) {
      classes.push(`xl:${prefix}-${responsive.xl}`);
    }

    return classes;
  }

  /**
   * Convert gap (pixels) to Tailwind class
   * 24px => gap-6 (because Tailwind scale: 1 = 4px, so 24/4 = 6)
   */
  private convertGapToTailwind(gapPx: number): string {
    const scale = Math.round(gapPx / 4);
    return `gap-${scale}`;
  }

  /**
   * Get justify-content Tailwind class
   */
  private getJustifyClass(justify: string): string {
    const map: Record<string, string> = {
      'center': 'justify-center',
      'start': 'justify-start',
      'end': 'justify-end',
      'between': 'justify-between',
      'around': 'justify-around',
      'evenly': 'justify-evenly',
    };
    return map[justify] || 'justify-center';
  }

  /**
   * Get align-items Tailwind class
   */
  private getAlignClass(align: string): string {
    const map: Record<string, string> = {
      'center': 'items-center',
      'start': 'items-start',
      'end': 'items-end',
      'stretch': 'items-stretch',
    };
    return map[align] || 'items-stretch';
  }

  /**
   * Check if Professional Grid is enabled
   */
  isProfessionalGridEnabled(gridConfig: any): boolean {
    return gridConfig?.heroGrid !== undefined && gridConfig?.heroGrid !== null;
  }

  /**
   * Get grid configuration (Professional or Legacy)
   */
  getGridConfig(gridConfig: any): IProfessionalGridConfig | null {
    if (this.isProfessionalGridEnabled(gridConfig)) {
      return gridConfig.heroGrid;
    }
    return null;
  }
}







