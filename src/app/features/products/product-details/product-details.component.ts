import { Component, OnInit, OnDestroy, ViewChild, ElementRef, signal, Inject, PLATFORM_ID, Attribute } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { takeUntil } from 'rxjs/operators';
import { TransferState, makeStateKey } from '@angular/core';

import { IProduct, ProductStatus, ProductVariant, ProductVariantAttribute } from '../models/product.interface';
import { ProductService } from '../services/product.service';
import { CartService } from '../../cart/services/cart.service';
import { BaseResponse, pagination } from '../../../core/models/baseResponse';
import { 
  UiToastService, 
  UiButtonComponent, 
  UiSpinnerComponent, 
  UiChipComponent,
  UiInputDirective
} from '../../../shared/ui';
import { ComponentBase } from '../../../core/directives/component-base.directive';
import { IAddToCartRequest } from '../../cart/models/cart.interface';
import { ProductCardComponent } from "../../../shared/components/product-card/product-card.component";
import { SafePipe } from '../../../core/pipes/safe.pipe';
import { IQueryParamsBuyNow } from '../../../interfaces/package.interface';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { TranslationService } from '../../../core/services/translate.service';
import { MultiLanguagePipe } from '../../../core/pipes/multi-language.pipe';
import { CurrencyPipe } from '../../../core/pipes/currency.pipe';
import { MultilingualText } from '../../../core/models/multi-language';
import { environment } from '../../../../environments/environment';
import { secureEncodeUrl } from '../../../core/utils/secure-query';
import { SeoService } from '../../../core/services/seo.service';

interface ProductImage {
  itemImageSrc: string;
  thumbnailImageSrc: string;
  alt: string;
  title: string;
}

const FRONTEND_DOMAIN = 'https://pledgestores.com';

@Component({
  selector: 'app-product-details',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    FormsModule,
    UiButtonComponent,
    UiSpinnerComponent,
    ProductCardComponent,
    SafePipe,
    TranslateModule,
    MultiLanguagePipe,
    CurrencyPipe
  ],
  templateUrl: './product-details.component.html',
  styleUrls: ['./product-details.component.scss']
})
export class ProductDetailsComponent extends ComponentBase implements OnInit {
  private static readonly PRODUCT_STATE_KEY = makeStateKey<IProduct>('product-details');
  @ViewChild('galleryImage') galleryImage!: ElementRef;
  currentImageIndex: number = 0;
  selectedColor: MultilingualText | null = null;
  selectedSize: MultilingualText | null = null;
  selectedVariantAttributes: ProductVariantAttribute[] = [];
  product: IProduct | null = null;
  loading = true;
  error: string | null = null;
  imageLoaded = false;
  quantity = 1;
  relatedProducts: IProduct[] = [];
  activeIndex = 0;
  isInWishlist = false;
  wishlistLoading = false;
  domain = environment.domain;
  productStatus = ProductStatus;
  // Image gallery
  images: ProductImage[] = [];
  responsiveOptions: any[];
  mappedVariants: {variant:string, attributes:ProductVariantAttribute[]}[] = [];
  // Accordion state
  openAccordionIndices = new Set<number>();
  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private productService: ProductService,
    private cartService: CartService,
    private toastService: UiToastService,
    private translationService: TranslationService,
    private translate: TranslateService,
    private seoService: SeoService,
    private transferState: TransferState,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {
    super();
    this.responsiveOptions = [
      {
        breakpoint: '1024px',
        numVisible: 5
      },
      {
        breakpoint: '768px',
        numVisible: 4
      }
    ];
  }

  onImageLoad() {
    this.imageLoaded = true;
  }

  ngOnInit(): void {

    this.route.paramMap
    .pipe(takeUntil(this.destroy$))
    .subscribe(params => {
      const productId = params.get('id');
      if (productId) {
        this.loadProduct(productId);
      }
    });
  }

  toggleWishlist(): void {
    if (!this.product) return;
    this.wishlistLoading = true;
    this.isInWishlist = !this.isInWishlist;
    setTimeout(() => {
      this.wishlistLoading = false;
    }, 1000);
    // this.wishlistService.toggleWishlist(this.product._id, this.selectedVariant?._id).subscribe({
    //   next: () => {
    //     this.wishlistLoading = false;
    //     this.isInWishlist = !this.isInWishlist;
    //   },
    //   error: (err) => {
    //     console.error('Error toggling wishlist:', err);
    //     this.wishlistLoading = false;
    //   }
    // });
  }
  private loadProduct(productId: string): void {
    this.loading = true;
    this.error = null;

    this.productService.getProductById(productId).pipe(
      takeUntil(this.destroy$)
    )
      .subscribe({
        next: (response: BaseResponse<IProduct>) => {
          this.product = response.data;
          this.transferState.set(ProductDetailsComponent.PRODUCT_STATE_KEY, this.product);
          this.afterProductLoaded();
          this.loading = false;
        },
        error: (err) => {
          console.error('Error loading product:', err);
          this.error = this.translate.instant('products.errors.load_failed');
          this.loading = false;
        }
      })
  }

  private afterProductLoaded(): void {
    if (!this.product) {
      return;
    }
    this.prepareImages();
    this.loadRelatedProducts(this.product._id);
    this.mappedVariants = this.productService.getUniqueAttributes(this.product.variants);
    this.autoSelectDefaultVariants();
    this.updateSeo(this.product);
  }

  private loadRelatedProducts(productId: string): void {

    this.productService.getProducts({ limit: 4 }).pipe(
      takeUntil(this.destroy$)
    )
      .subscribe({
        next: (response: BaseResponse<{ products: IProduct[]; pagination: pagination }>) => {
          this.relatedProducts = response.data.products;
        },
        error: (err) => {
          console.error('Error loading related products:', err);
        }
      })
  }

  private prepareImages(): void {
    if (!this.product) return;

    this.images = [];

    // Add main image if exists
    // if (this.product.images) {
    //   this.images.push({
    //     itemImageSrc: this.getImageUrl(this.product.images[0].filePath),
    //     thumbnailImageSrc: this.getImageUrl(this.product.images[0].filePath, 'thumbnail'),
    //     alt: this.product.name,
    //     title: this.product.name
    //   });
    // }

    // Add additional images
    if (this.product.images && this.product.images.length > 0) {
      this.product.images.forEach(image => {
        this.images.push({
          itemImageSrc: this.getImageUrl(image.filePath),
          thumbnailImageSrc: this.getImageUrl(image.filePath, 'thumbnail'),
          alt: this.product?.name[this.currentLanguage] || '',
          title: this.product?.name[this.currentLanguage] || ''
        });
      });
    }
    // If no images, add a placeholder
    if (this.images.length === 0) {
      this.images.push({
        itemImageSrc: 'assets/images/logo.png',
        thumbnailImageSrc: 'assets/images/logo.png',
        alt: 'No image available',
        title: 'No image available'
      });
    }
  }

  getImageUrl(imagePath: string, size: 'original' | 'thumbnail' = 'original'): string {
    if (!imagePath) return 'assets/images/photo.png';
    if (imagePath.startsWith('http')) return imagePath;
    return `${this.domain}/${imagePath}`;
  }

  getDiscountPercentage(price: number, discountPrice?: number): number | null {
    if (!price || !discountPrice || discountPrice <= 0 || discountPrice >= price) {
      return null;
    }
    return Math.round((((price) - (price - discountPrice)) / price) * 100);
  }

  

  isVariantSelected(attribute: ProductVariantAttribute): boolean {
    return this.selectedVariantAttributes.some(v => v._id === attribute._id);
  }

  onVariantSelect(attribute: ProductVariantAttribute): void {
    const hasSameVariant = this.selectedVariantAttributes.some(v => v.variant === attribute.variant);
    if(!this.isVariantSelected(attribute) && !hasSameVariant) {
      this.selectedVariantAttributes.push(attribute);
    } else {
      if (hasSameVariant) {
        const index = this.selectedVariantAttributes.findIndex(v => v.variant === attribute.variant);
        this.selectedVariantAttributes.splice(index, 1);
        this.selectedVariantAttributes.push(attribute);
      }
    }
    this.quantity = 1; // Reset quantity when variant changes
  }

  /**
   * Auto-select the first variant (index 0) of each variant type
   */
  private autoSelectDefaultVariants(): void {
    if (!this.mappedVariants || this.mappedVariants.length === 0) return;
    
    // Clear any existing selections
    this.selectedVariantAttributes = [];
    
    // Select the first attribute of each variant type
    this.mappedVariants.forEach(mappedVariant => {
      if (mappedVariant.attributes && mappedVariant.attributes.length > 0) {
        // Select the first attribute (index 0)
        this.selectedVariantAttributes.push(mappedVariant.attributes[0]);
      }
    });
  }

  checkCart(): boolean {
    return !this.product || (!this.selectedVariantAttributes) || (this.selectedVariantAttributes.length === 0 && this.product.variants && this.product.variants.length > 0);
  }

  addToCart(): void {
    if (this.product?.status !== ProductStatus.ACTIVE) {
      this.toastService.warn(
        this.translate.instant('products.notifications.not_available'),
        this.translate.instant('common.warning')
      );
      return;
    }
    if (this.checkCart()) {
      this.toastService.warn(
        this.translate.instant('products.notifications.select_variant'),
        this.translate.instant('common.warning')
      );
      return;
    };
    if (!this.product) return;
    const variantBasePrice = this.getVariantBasePrice();
    const productToAdd: IAddToCartRequest = {
      productId: this.product._id,
      price: variantBasePrice,
      quantity: this.quantity,
      selectedVariants: this.selectedVariantAttributes,
      image: this.selectedVariantAttributes[0]?.image?.filePath || this.product.images?.[0]?.filePath,
      productName: this.product.name,
      discount: this.product.discountPrice || 0,
    };

    this.cartService.addToCart(productToAdd);

    this.toastService.success(
      this.translate.instant('products.notifications.added_to_cart_detail', {
        quantity: this.quantity,
        product: this.getLocalizedProductName()
      }),
      this.translate.instant('products.notifications.added_to_cart_summary')
    );
  }

  checkout(): void {
    if (this.product?.status !== ProductStatus.ACTIVE) {
      this.toastService.warn(
        this.translate.instant('products.notifications.not_available'),
        this.translate.instant('common.warning')
      );
      return;
    }
    if (this.checkCart()) {
      this.toastService.warn(
        this.translate.instant('products.notifications.select_variant'),
        this.translate.instant('common.warning')
      );
      return;
    }

    const selectedImage = this.selectedVariantAttributes.find(v => v.variant === 'color')?.image?.filePath || this.product?.images?.[0]?.filePath;
    const queryParams: IQueryParamsBuyNow = {
      type: 'Product',
      productId: this.product?._id, 
      quantity: this.quantity,
      selectedVariants: this.selectedVariantAttributes,
      name: this.product?.name, 
      price: this.getVariantBasePrice(),
      discount: this.product?.discountPrice,
      image: selectedImage,
    } 
    let secureQuery = secureEncodeUrl(queryParams);
    this.router.navigate(['/checkout'],
      {
        queryParams: {
          buyNow: secureQuery
        }
      });
  }

  addToWishlist(): void {
    if (!this.product) return;
    // TODO: Implement wishlist functionality
    this.toastService.info(
      this.translate.instant('products.notifications.wishlist_coming_soon_detail'),
      this.translate.instant('products.notifications.wishlist_coming_soon_title')
    );
  }

  increaseQuantity(): void {
    // const maxQuantity = this.selectedVariant[0]?.stock || this.product?.stock || 10;
    // if (this.quantity < this.product?.stock) {
      this.quantity++;
    // }
  }

  decreaseQuantity(): void {
    if (this.quantity > 1) {
      this.quantity--;
    }
  }

  // onQuantityChange(event: any): void {
  //   const value = parseInt(event.target.value, 10);
  //   if (!isNaN(value) && value > 0) {
  //     const maxQuantity = this.product?.stock ;
  //     this.quantity = Math.min(value, maxQuantity);
  //   } else {
  //     this.quantity = 1;
  //   }
  // }

  navigateToProduct(product: any): void {
    this.router.navigate(['/shop', product._id , product.name.en]);
  }

  getVariantOptions(variant: any): string {
    if (!variant?.options || variant?.options?.length === 0) return '';
    return variant?.options?.map((opt: any) => `${opt.name}: ${opt.value}`).join(', ');
  }

  getStockStatus(stock: number | undefined): { text: string; severity: string } {
    if (stock === undefined) return { text: 'In Stock', severity: 'success' };
    if (stock === 0) return { text: 'Out of Stock', severity: 'danger' };
    if (stock < 5) return { text: `Only ${stock} left`, severity: 'warning' };
    return { text: 'In Stock', severity: 'success' };
  }

  get currentLanguage(): 'en' | 'ar' {
    return this.translationService.getCurrentLanguage() as 'en' | 'ar';
  }

  scrollToTop(): void {
    if (isPlatformBrowser(this.platformId)) {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }

  share(): void {
    if (!this.product) return;
    const url = window.location.href;
    navigator.share({
      url: url
    });
  }

  get basePrice(): number {
    return this.getVariantBasePrice();
  }

  get effectivePrice(): number {
    const discount = this.product?.discountPrice || 0;
    const effective = this.basePrice - discount;
    return effective > 0 ? effective : 0;
  }

  get hasDiscount(): boolean {
    const discount = this.product?.discountPrice || 0;
    return discount > 0 && discount < this.basePrice;
  }

  private getActiveVariant(): ProductVariant | null {
    if (!this.product?.useVariantPrice || !this.product?.variants?.length) {
      return null;
    }

    if (!this.selectedVariantAttributes?.length) {
      return this.product.variants[0] || null;
    }

    return (
      this.product.variants.find(variant => {
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
      .map(variant => variant.price)
      .filter((price): price is number => price != null);

    if (variantPrices.length) {
      return Math.min(...variantPrices);
    }

    return this.product.price || 0;
  }

  private updateSeo(product: IProduct): void {
    const localizedName = product.name?.[this.currentLanguage] || product.name?.en || '';
    const localizedSummary = product.description?.[this.currentLanguage] || product.description?.en || '';
    const description = localizedSummary
      ? localizedSummary.replace(/<[^>]+>/g, '').substring(0, 160)
      : `Discover ${localizedName} with premium quality on pledgestores.com.`;
    const canonicalUrl = `${FRONTEND_DOMAIN}/shop/${product._id}`;
    const ogImage = product.images?.length
      ? `${environment.domain}/${product.images[0].filePath}`
      : `${environment.domain}/assets/images/logo.png`;

    this.seoService.updateSeo({
      title: `${localizedName} | pledgestores.com`,
      description,
      keywords: product.tags?.join(', '),
      canonicalUrl,
      ogImage,
      ogType: 'product',
      hreflangs: [
        { lang: 'en', url: `${FRONTEND_DOMAIN}/shop/${product._id}` },
        { lang: 'ar', url: `${FRONTEND_DOMAIN}/shop/${product._id}` },
        { lang: 'x-default', url: canonicalUrl }
      ]
    });

    this.seoService.injectStructuredData({
      '@context': 'https://schema.org',
      '@type': 'Product',
      name: localizedName,
      image: ogImage,
      description,
      sku: product.sku || product._id,
      offers: {
        '@type': 'Offer',
        priceCurrency: 'SAR',
        price: (this.getVariantBasePrice() - (product.discountPrice || 0)).toFixed(2),
        availability: product.status === ProductStatus.ACTIVE
          ? 'https://schema.org/InStock'
          : 'https://schema.org/OutOfStock',
        url: canonicalUrl
      },
      brand: product.brand?.name
        ? {
            '@type': 'Brand',
            name: product.brand.name[this.currentLanguage] || product.brand.name.en || product.brand.name.ar
          }
        : undefined
    });
  }

  private getLocalizedProductName(): string {
    if (!this.product?.name) {
      return '';
    }
    return this.product.name[this.currentLanguage] || this.product.name.en || this.product.name.ar || '';
  }

  // Gallery navigation
  previousImage(): void {
    if (this.images.length > 0) {
      this.activeIndex = (this.activeIndex - 1 + this.images.length) % this.images.length;
    }
  }

  nextImage(): void {
    if (this.images.length > 0) {
      this.activeIndex = (this.activeIndex + 1) % this.images.length;
    }
  }

  // Accordion methods
  toggleAccordion(index: number): void {
    if (this.openAccordionIndices.has(index)) {
      this.openAccordionIndices.delete(index);
    } else {
      this.openAccordionIndices.add(index);
    }
  }

  isAccordionOpen(index: number): boolean {
    return this.openAccordionIndices.has(index);
  }
}
