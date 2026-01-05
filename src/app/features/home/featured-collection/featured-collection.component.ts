import { Component } from '@angular/core';
import { IFeaturedCollection, IResponsiveGridConfig } from '../../../interfaces/featured-collection';
import { BaseResponse } from '../../../core/models/baseResponse';
import { FeaturedCollectionsService } from './featured-collection.service';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
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
  constructor(private featuredCollectionService: FeaturedCollectionsService) {
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
}
