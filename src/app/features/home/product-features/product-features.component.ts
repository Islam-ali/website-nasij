import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ProductFeaturesService } from '../../../services/product-features.service';
import { IProductFeature } from '../../../interfaces/product-feature.interface';
import { IProduct } from '../../products/models/product.interface';
import { BaseResponse } from '../../../core/models/baseResponse';
import { CarouselComponent } from '../../../shared/components/carousel/carousel.component';
import { TranslateModule } from '@ngx-translate/core';
import { MultiLanguagePipe } from '../../../core/pipes/multi-language.pipe';

@Component({
  selector: 'app-product-features',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    CarouselComponent,
    TranslateModule,
    MultiLanguagePipe,
  ],
  templateUrl: './product-features.component.html',
  styleUrl: './product-features.component.scss',
})
export class ProductFeaturesComponent implements OnInit {
  features: IProductFeature[] = [];
  featureProducts: Map<string, IProduct[]> = new Map();

  @Output() productClick = new EventEmitter<IProduct>();

  constructor(private featuresService: ProductFeaturesService) {}

  ngOnInit(): void {
    this.loadFeatures();
  }

  loadFeatures(): void {
    this.featuresService.getAllActive().subscribe({
      next: (response: BaseResponse<IProductFeature[]>) => {
        this.features = response.data;
        // Load products for each feature
        this.features.forEach((feature) => {
          this.loadFeatureProducts(feature);
        });
      },
      error: (error) => {
        console.error('Error loading features:', error);
      },
    });
  }

  loadFeatureProducts(feature: IProductFeature): void {
    this.featuresService.getFeatureProducts(feature._id).subscribe({
      next: (response: BaseResponse<IProduct[]>) => {
        this.featureProducts.set(feature._id, response.data);
      },
      error: (error) => {
        console.error(`Error loading products for feature ${feature._id}:`, error);
        this.featureProducts.set(feature._id, []);
      },
    });
  }

  getFeatureProducts(featureId: string): IProduct[] {
    return this.featureProducts.get(featureId) || [];
  }

  onProductClick(product: IProduct): void {
    this.productClick.emit(product);
  }
}

