import { Component, EventEmitter, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ProductFeaturesService } from '../../../services/product-features.service';
import { BusinessProfileService } from '../../../services/business-profile.service';
import { IProductFeature, HeaderAlignment } from '../../../interfaces/product-feature.interface';
import { IBusinessProfile } from '../../../interfaces/business-profile.interface';
import { IProduct } from '../../products/models/product.interface';
import { BaseResponse } from '../../../core/models/baseResponse';
import { CarouselComponent } from '../../../shared/components/carousel/carousel.component';
import { TranslateModule } from '@ngx-translate/core';
import { MultiLanguagePipe } from '../../../core/pipes/multi-language.pipe';
import { takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs';

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
export class ProductFeaturesComponent implements OnInit, OnDestroy {
  features: IProductFeature[] = [];
  featureProducts: Map<string, IProduct[]> = new Map();
  businessProfile: IBusinessProfile | null = null;
  private destroy$ = new Subject<void>();

  @Output() productClick = new EventEmitter<IProduct>();

  constructor(
    private featuresService: ProductFeaturesService,
    private businessProfileService: BusinessProfileService
  ) {}

  ngOnInit(): void {
    this.loadBusinessProfile();
    this.loadFeatures();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadBusinessProfile(): void {
    this.businessProfileService.getBusinessProfile$()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (profile) => {
          this.businessProfile = profile;
        },
        error: (error) => {
        }
      });
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
      },
    });
  }

  loadFeatureProducts(feature: IProductFeature): void {
    this.featuresService.getFeatureProducts(feature._id).subscribe({
      next: (response: BaseResponse<IProduct[]>) => {
        this.featureProducts.set(feature._id, response.data);
      },
      error: (error) => {
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

  getHeaderAlignmentClass(): string {
    const alignment = this.businessProfile?.headerAlignment || HeaderAlignment.CENTER;
    switch (alignment) {
      case HeaderAlignment.START:
        return 'text-start items-start justify-start';
      case HeaderAlignment.END:
        return 'text-end items-end justify-end';
      case HeaderAlignment.CENTER:
      default:
        return 'text-center items-center justify-center';
    }
  }
}







