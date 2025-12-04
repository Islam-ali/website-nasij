import { Component, EventEmitter, Inject, Input, OnChanges, OnInit, Output, SimpleChanges } from '@angular/core';
import { NgClass } from '@angular/common';
import { Router, RouterModule } from '@angular/router';

// Services
import { environment } from '../../../../environments/environment';
import { WishlistService } from '../../../features/wishlist/services/wishlist.service';
import { IAddToWishlistRequest } from '../../../features/wishlist/models/wishlist.interface';
import { EnumProductVariant, ProductVariant, ProductVariantAttribute } from '../../../features/products/models/product.interface';
import { TranslationService } from '../../../core/services/translate.service';
import { MultiLanguagePipe } from '../../../core/pipes/multi-language.pipe';
import { CurrencyPipe } from '../../../core/pipes/currency.pipe';
import { ProductService } from '../../../features/products/services/product.service';
import { FallbackImgDirective } from '../../../core/directives/fallback-img.directive';
import { ProductStatus } from '../../../interfaces/product.interface';
import { TranslateModule } from '@ngx-translate/core';
import { UiToastService } from '../../ui';
import { MultilingualText } from '../../../core/models/multi-language';
  @Component({
  selector: 'app-product-card',
  standalone: true,
  imports: [
    RouterModule,
    NgClass,
    MultiLanguagePipe,
    CurrencyPipe,
    FallbackImgDirective,
    TranslateModule
],
  providers: [
    TranslationService
  ],
  templateUrl: './product-card.component.html',
  styleUrl: './product-card.component.scss'
})
export class ProductCardComponent implements OnInit, OnChanges {
  @Input() product!: any;
  @Input() showViewDetails = true;
  @Output() clicked: EventEmitter<any> = new EventEmitter<any>();
  quantity = 1;
  loading = false;
  domain = environment.domain;
  productStatus = ProductStatus;
  selectedVariantAttributes: ProductVariantAttribute[] = [];
  mappedVariants: {variant: string, attributes: ProductVariantAttribute[]}[] = [];
  
  get basePrice(): number {
    return this.getVariantBasePrice();
  }

  private getVariantBasePrice(): number {
    if (!this.product) {
      return 0;
    }

    if (!this.product.useVariantPrice) {
      return this.product.price || 0;
    }

    const activeVariant = this.getActiveVariant();
    if (activeVariant?.price != null) {
      return activeVariant.price;
    }

    const variantPrices = (this.product.variants || [])
      .map((variant: ProductVariant) => variant.price)
      .filter((price: number | undefined): price is number => price != null);

    if (variantPrices.length) {
      return Math.min(...variantPrices);
    }

    return this.product.price || 0;
  }

  private getActiveVariant(): ProductVariant | null {
    if (!this.product?.useVariantPrice || !this.product?.variants?.length) {
      return null;
    }

    if (!this.selectedVariantAttributes?.length) {
      return this.product.variants[0] || null;
    }

    return (
      this.product.variants.find((variant: ProductVariant) => {
        if (!variant.attributes?.length) {
          return false;
        }
        return variant.attributes.every(attr =>
          this.selectedVariantAttributes.some(sel => {
            if (sel._id && attr._id && sel._id === attr._id) {
              return true;
            }
            return (
              sel.variant === attr.variant &&
              this.compareMultilingualValues(sel.value, attr.value as any)
            );
          })
        );
      }) || null
    );
  }

  private compareMultilingualValues(
    selectedValue: MultilingualText,
    variantValue: MultilingualText
  ): boolean {
    const normalize = (value: MultilingualText) => ({
      en: (value?.en || '').toString().toLowerCase().trim(),
      ar: (value?.ar || '').toString().toLowerCase().trim()
    });

    const sel = normalize(selectedValue);
    const variant = normalize(variantValue);
    return sel.en === variant.en && sel.ar === variant.ar;
  }

  get price(): number {
    const discount = this.product?.discountPrice || 0;
    const salePrice = this.basePrice - discount;
    return salePrice > 0 ? salePrice : 0;
  }

  get isOnSale(): boolean {
    const discount = this.product?.discountPrice || 0;
    return discount > 0 && discount < this.basePrice;
  }
  
  get discountPercentage(): number {
    if (!this.isOnSale) return 0;
    const discount = this.product?.discountPrice || 0;
    return Math.round((((this.price) - (this.price - discount)) / this.basePrice) * 100);
  }

  constructor(
    private router: Router,
    private wishlistService: WishlistService,
    private toastService: UiToastService,
    private translationService: TranslationService,
    public productService: ProductService
  ) {}

  // Get product image with fallback to placeholder
  getProductImage(product: any): string {
    const imagePath = product?.images?.[0]?.filePath;
    return imagePath ? `${this.domain}/${imagePath}` : 'assets/images/placeholder.png';
  }

  // Handle image loading errors
  handleImageError(event: Event): void {
    const imgElement = event.target as HTMLImageElement;
    imgElement.src = 'assets/images/placeholder.png';
  }
  
  // Handle rating changes
  onRate(event: any): void {
    // Handle rating changes if needed
  }
  
  navigateToProduct(product: any): void {
    this.clicked.emit(product);
  }
  
  ngOnInit(): void {
    // Check if product is in wishlist
    if (this.product) {
      this.initializeVariants();
    }
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['product']) {
      this.extractColorsAndSizes();
      this.initializeVariants();
    }
  }

  private initializeVariants(): void {
    if (!this.product?.variants?.length) {
      this.mappedVariants = [];
      this.selectedVariantAttributes = [];
      return;
    }
    
    this.mappedVariants = this.productService.getUniqueAttributes(this.product.variants);
    this.autoSelectDefaultVariants();
  }

  private autoSelectDefaultVariants(): void {
    if (!this.mappedVariants || this.mappedVariants.length === 0) return;
    
    this.selectedVariantAttributes = [];
    
    this.mappedVariants.forEach(mappedVariant => {
      if (mappedVariant.attributes && mappedVariant.attributes.length > 0) {
        this.selectedVariantAttributes.push(mappedVariant.attributes[0]);
      }
    });
  }

  isVariantSelected(attribute: ProductVariantAttribute): boolean {
    return this.selectedVariantAttributes.some(v => v._id === attribute._id);
  }

  onVariantSelect(attribute: ProductVariantAttribute, event?: Event): void {
    if (event) {
      event.stopPropagation();
    }
    
    const hasSameVariant = this.selectedVariantAttributes.some(v => v.variant === attribute.variant);
    if (!this.isVariantSelected(attribute) && !hasSameVariant) {
      this.selectedVariantAttributes.push(attribute);
    } else {
      if (hasSameVariant) {
        const index = this.selectedVariantAttributes.findIndex(v => v.variant === attribute.variant);
        this.selectedVariantAttributes.splice(index, 1);
        this.selectedVariantAttributes.push(attribute);
      }
    }
  }

  getImageUrl(imagePath: string): string {
    if (!imagePath) return 'assets/images/photo.png';
    if (imagePath.startsWith('http')) return imagePath;
    return `${this.domain}/${imagePath}`;
  }

  getProductImageUrl(): string {
    // If variant with image is selected, use that image
    const selectedColorVariant = this.selectedVariantAttributes.find(
      attr => attr.variant === 'color' && attr.image?.filePath
    );
    
    if (selectedColorVariant?.image?.filePath) {
      return this.getImageUrl(selectedColorVariant.image.filePath);
    }
    
    // Otherwise use the first product image
    if (this.product?.images?.[0]?.filePath) {
      return this.getImageUrl(this.product.images[0].filePath);
    }
    
    return 'assets/images/photo.png';
  }

  // add to wishlist
  addToWishlist(product: any): void {
    this.loading = true;
    const wishlistItem: IAddToWishlistRequest = {
      productId: product._id || '',
      addedAt: new Date(),
      product: product
    };
    this.wishlistService.addToWishlist(wishlistItem).subscribe({
      next: () => {
        this.loading = false;
        this.toastService.success(`${product.name} added to wishlist.`, 'Added to Wishlist');
      },
      error: (error) => {
        this.loading = false;
        this.toastService.error(error.message || 'Unable to add to wishlist.', 'Error');
      }
    });
  }

  // extract colors and sizes from variants
  private extractColorsAndSizes(): void {
    if (!this.product || !this.product.variants) return;

    const colors = new Set<string>();
    const sizes = new Set<string>();

    this.product.variants.forEach((variant: any) => {
      if (variant.attributes) {
        variant.attributes.forEach((attr: any) => {
          if (attr.variant === EnumProductVariant.COLOR) {
            const colorValue = typeof attr.value === 'string' ? attr.value : ((attr.value as any)[this.currentLanguage] || (attr.value as any).en);
            colors.add(colorValue);
          } else if (attr.variant === EnumProductVariant.SIZE) {
            const sizeValue = typeof attr.value === 'string' ? attr.value : ((attr.value as any)[this.currentLanguage] || (attr.value as any).en);
            sizes.add(sizeValue);
          }
        });
      }
    });

    this.product.colors = Array.from(colors);
    this.product.sizes = Array.from(sizes);
  }

  get currentLanguage(): 'en' | 'ar' {
    return this.translationService.getCurrentLanguage() as 'en' | 'ar';
  }
}
