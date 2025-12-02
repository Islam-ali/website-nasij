import { Component } from '@angular/core';
import { IFeaturedCollection } from '../../../interfaces/featured-collection';
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
}
