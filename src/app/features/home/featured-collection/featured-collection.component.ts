import { Component } from '@angular/core';
import { IFeaturedCollection, IResponsiveGridConfig } from '../../../interfaces/featured-collection';
import { BaseResponse } from '../../../core/models/baseResponse';
import { FeaturedCollectionsService } from './featured-collection.service';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { MultiLanguagePipe } from '../../../core/pipes/multi-language.pipe';
import { FallbackImgDirective } from '../../../core/directives/fallback-img.directive';
  
@Component({
  selector: 'app-featured-collection',
  standalone: true,
  imports: [CommonModule, RouterModule, MultiLanguagePipe, FallbackImgDirective],
  templateUrl: './featured-collection.component.html',
})
export class FeaturedCollectionComponent {
  featuredCollections: IFeaturedCollection[] = [];
  constructor(private featuredCollectionService: FeaturedCollectionsService, private router: Router) {
    this.featuredCollectionService.getFeaturedCollections().subscribe((featuredCollections: BaseResponse<IFeaturedCollection[]>) => {
      this.featuredCollections = featuredCollections.data;
    });
  }

  getGridClasses(gridCols: IResponsiveGridConfig): string {
    const classes: string[] = [];
    if (gridCols.sm) classes.push(`grid-cols-${gridCols.sm}`);
    if (gridCols.md) classes.push(`md:grid-cols-${gridCols.md}`);
    if (gridCols.lg) classes.push(`lg:grid-cols-${gridCols.lg}`);
    if (gridCols.xl) classes.push(`xl:grid-cols-${gridCols.xl}`);
    return classes.join(' ');
  }

  getColSpanClasses(colSpan: IResponsiveGridConfig): string {
    const classes: string[] = [];
    if (colSpan.sm) classes.push(`col-span-${colSpan.sm}`);
    if (colSpan.md) classes.push(`md:col-span-${colSpan.md}`);
    if (colSpan.lg) classes.push(`lg:col-span-${colSpan.lg}`);
    if (colSpan.xl) classes.push(`xl:col-span-${colSpan.xl}`);
    return classes.join(' ');
  }

  getJustifyContentClass(justifyContent?: string): string {
    if (!justifyContent) return 'justify-center';
    const map: { [key: string]: string } = {
      'center': 'justify-center',
      'start': 'justify-start',
      'end': 'justify-end',
      'between': 'justify-between',
      'around': 'justify-around',
      'evenly': 'justify-evenly'
    };
    return map[justifyContent] || 'justify-center';
  }

  getAlignItemsClass(alignItems?: string): string {
    if (!alignItems) return 'items-stretch';
    const map: { [key: string]: string } = {
      'center': 'items-center',
      'start': 'items-start',
      'end': 'items-end',
      'stretch': 'items-stretch'
    };
    return map[alignItems] || 'items-stretch';
  }

  getHeightStyle(gridConfig: any): { [key: string]: string } {
    if (!gridConfig) return { 'min-height': '400px' };
    
    const styles: { [key: string]: string } = {};
    const mode = gridConfig.heightMode || 'min';
    const height = gridConfig.height || '400px';
    const aspectRatio = gridConfig.aspectRatio;

    switch (mode) {
      case 'fixed':
        styles['height'] = height;
        break;
      case 'min':
        styles['min-height'] = height;
        break;
      case 'max':
        styles['max-height'] = height;
        break;
      case 'aspect-ratio':
        if (aspectRatio) {
          styles['aspect-ratio'] = aspectRatio;
        } else {
          styles['min-height'] = height;
        }
        break;
      case 'auto':
      default:
        styles['min-height'] = height;
        break;
    }

    return styles;
  }
  onButtonClick(buttonLink: string) {
    this.router.navigateByUrl(buttonLink);
  }

  getParentStyle(gridConfig: any): { [key: string]: string } {
    const styles: { [key: string]: string } = {};
    
    // Backward compatibility: if parentCustomStyle is an object (old format), apply as inline styles
    if (gridConfig?.parentCustomStyle && typeof gridConfig.parentCustomStyle === 'object') {
      return gridConfig.parentCustomStyle;
    }
    
    // Only apply inline width if parentCustomStyle doesn't contain width classes
    const parentClass = this.getParentClass(gridConfig);
    const hasWidthClass = parentClass && (
      parentClass.includes('w-full') || 
      parentClass.includes('w-[') || 
      /\bw-\d+/.test(parentClass) ||
      parentClass.includes('max-w-') ||
      parentClass.includes('min-w-')
    );
    
    // Apply inline width only if no width class exists in parentCustomStyle
    if (gridConfig?.width && !hasWidthClass) {
      styles['width'] = gridConfig.width;
    }
    
    return styles;
  }

  getParentClass(gridConfig: any): string {
    // Only return classes if parentCustomStyle is a string (Tailwind classes)
    if (gridConfig?.parentCustomStyle && typeof gridConfig.parentCustomStyle === 'string') {
      return gridConfig.parentCustomStyle.trim();
    }
    return '';
  }

  getGridContainerClasses(gridConfig: any): string {
    const classes: string[] = [];
    
    if (!gridConfig?.width) {
      classes.push('max-w-[1922px]');
    }
    classes.push('mx-auto');
    
    const gridCols = gridConfig?.gridCols || { sm: 1, md: 2, lg: 3, xl: 4 };
    classes.push(this.getGridClasses(gridCols));
    classes.push(this.getJustifyContentClass(gridConfig?.justifyContent));
    classes.push(this.getAlignItemsClass(gridConfig?.alignItems));
    
    const parentClass = this.getParentClass(gridConfig);
    if (parentClass) {
      classes.push(parentClass);
    }
    
    return classes.filter(c => c).join(' ');
  }

  getItemContainerClasses(gridConfig: any, index: number): string {
    const classes: string[] = [];
    
    const colSpans = gridConfig?.colSpans?.[index] || { sm: 1, md: 2, lg: 2, xl: 2 };
    classes.push(this.getColSpanClasses(colSpans));
    
    const itemClass = this.getItemClass(gridConfig, index);
    if (itemClass) {
      classes.push(itemClass);
    }
    
    return classes.filter(c => c).join(' ');
  }

  getItemStyle(gridConfig: any, index: number): { [key: string]: string } {
    const styles: { [key: string]: string } = {};
    
    // Apply height style
    const heightStyle = this.getHeightStyle(gridConfig);
    Object.assign(styles, heightStyle);
    
    return styles;
  }

  getItemClass(gridConfig: any, index: number): string {
    if (gridConfig?.itemsCustomStyle && gridConfig.itemsCustomStyle[index]) {
      const itemStyle = gridConfig.itemsCustomStyle[index];
      if (typeof itemStyle === 'string') {
        return itemStyle.trim();
      } else if (typeof itemStyle === 'object') {
        // Backward compatibility: if it's an object, convert to string
        return Object.keys(itemStyle)
          .map(key => `${key}: ${itemStyle[key]}`)
          .join('; ');
      }
    }
    return '';
  }

}
