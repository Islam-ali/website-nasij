import { Component, OnInit, OnDestroy, ViewChild, ElementRef, signal, Inject, PLATFORM_ID, Attribute } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { takeUntil } from 'rxjs/operators';

// PrimeNG Modules
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { GalleriaModule } from 'primeng/galleria';
import { RatingModule } from 'primeng/rating';
import { ButtonModule } from 'primeng/button';
import { RippleModule } from 'primeng/ripple';
import { InputNumberModule } from 'primeng/inputnumber';
import { ChipModule } from 'primeng/chip';
import { SkeletonModule } from 'primeng/skeleton';
import { MessageService } from 'primeng/api';
import { MessageModule } from 'primeng/message';
import { ToastModule } from 'primeng/toast';
import { TooltipModule } from 'primeng/tooltip';
import { IProduct, ProductVariant, ProductVariantAttribute } from '../models/product.interface';
import { ProductService } from '../services/product.service';
import { CartService } from '../../cart/services/cart.service';
import { TabsModule } from 'primeng/tabs';
import { BaseResponse, pagination } from '../../../core/models/baseResponse';
import { AccordionModule } from 'primeng/accordion';
import { ComponentBase } from '../../../core/directives/component-base.directive';
import { IAddToCartRequest } from '../../cart/models/cart.interface';
import { ProductCardComponent } from "../../../shared/components/product-card/product-card.component";
import { SafePipe } from '../../../core/pipes/safe.pipe';
import { IQueryParamsBuyNow } from '../../../interfaces/package.interface';
import { TranslateModule } from '@ngx-translate/core';
import { TranslationService } from '../../../core/services/translate.service';
import { MultiLanguagePipe } from '../../../core/pipes/multi-language.pipe';
import { MultilingualText } from '../../../core/models/multi-language';

interface ProductImage {
  itemImageSrc: string;
  thumbnailImageSrc: string;
  alt: string;
  title: string;
}

@Component({
  selector: 'app-product-details',
  standalone: true,
  providers: [MessageService],
  imports: [
    CommonModule,
    RouterModule,
    FormsModule,
    ButtonModule,
    RippleModule,
    RatingModule,
    InputNumberModule,
    GalleriaModule,
    ChipModule,
    SkeletonModule,
    MessageModule,
    ToastModule,
    TooltipModule,
    ProgressSpinnerModule,
    TabsModule,
    AccordionModule,
    ProductCardComponent,
    SafePipe,
    TranslateModule,
    MultiLanguagePipe
  ],
  templateUrl: './product-details.component.html',
  styleUrls: ['./product-details.component.scss']
})
export class ProductDetailsComponent extends ComponentBase implements OnInit {
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

  // Image gallery
  images: ProductImage[] = [];
  responsiveOptions: any[];
  mappedVariants: {variant:string, attributes:ProductVariantAttribute[]}[] = [];
  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private productService: ProductService,
    private cartService: CartService,
    private messageService: MessageService,
    private translationService: TranslationService,
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
    this.route.paramMap.subscribe(params => {
      const productId = params.get('id');
      if (productId) {
        this.loadProduct(productId);
      } else {
        this.error = 'Product not found';
        this.loading = false;
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
          this.prepareImages();
          this.loadRelatedProducts(this.product._id);
          this.mappedVariants = this.mapVariants(this.product.variants);
          this.loading = false;
        },
        error: (err) => {
          console.error('Error loading product:', err);
          this.error = 'Failed to load product details. Please try again later.';
          this.loading = false;
        }
      })
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
    console.log(this.images);
    // If no images, add a placeholder
    if (this.images.length === 0) {
      this.images.push({
        itemImageSrc: 'assets/images/placeholder.png',
        thumbnailImageSrc: 'assets/images/placeholder.png',
        alt: 'No image available',
        title: 'No image available'
      });
    }
  }

  getImageUrl(imagePath: string, size: 'original' | 'thumbnail' = 'original'): string {
    if (!imagePath) return 'assets/images/placeholder.png';
    if (imagePath.startsWith('http')) return imagePath;
    return imagePath;
  }

  getDiscountPercentage(price: number, discountPrice?: number): number | null {
    if (discountPrice && discountPrice < price) {
      return Math.round(100 - ((price - discountPrice) / price) * 100);
    }
    return null;
  }

   mapVariants(variants:ProductVariant[]  ):{variant:string, attributes:ProductVariantAttribute[]}[] {
    const variantMap: Record<string, ProductVariantAttribute[]> = {};
  
    variants.forEach(variant => {
      variant.attributes?.forEach(attr => {
        if (!variantMap[attr.variant]) {
          variantMap[attr.variant] = [];
        }
  
        const exists = variantMap[attr.variant].some(
          a => a._id === attr._id
        );
        if (!exists) {
          variantMap[attr.variant].push(attr);
        }
      });
    });
    return Object.entries(variantMap).map(([variant, attributes]) => ({
      variant,
      attributes
    }));
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
    console.log(this.selectedVariantAttributes);
  }

  checkCart(): boolean {
    return !this.product || (!this.selectedVariantAttributes || this.selectedVariantAttributes.length === 0);
  }

  addToCart(): void {
    if (this.checkCart()) {
      this.messageService.add({
        severity: 'warn',
        summary: 'Warning',
        detail: 'Please select a color',
        life: 1000
      });
      return;
    };
    if (!this.product) return;
    const productToAdd: IAddToCartRequest = {
      productId: this.product._id,
      price: this.product.price,
      quantity: this.quantity,
      selectedVariants: this.selectedVariantAttributes,
      image: this.selectedVariantAttributes[0]?.image?.filePath || this.product.images[0].filePath,
      productName: this.product.name,
      discount: this.product.discountPrice || 0,
    };

    this.cartService.addToCart(productToAdd);

    this.messageService.add({
      severity: 'success',
      summary: 'Added to Cart',
      detail: `${this.quantity} x ${this.product.name[this.currentLanguage]} has been added to your cart`,
      life: 1000
    });
  }

  checkout(): void {
    if (this.checkCart()) {
      this.messageService.add({
        severity: 'warn',
        summary: 'Warning',
        detail: 'Please select a color',
        life: 1000
      });
      return;
    }
    const queryParams: IQueryParamsBuyNow = {
      type: 'product',
      productId: this.product?._id, quantity: this.quantity,
      selectedVariants: this.selectedVariantAttributes,
      name: this.product?.name, price: this.product?.price,
      discount: this.product?.discountPrice,
      image: this.selectedVariantAttributes[0]?.image?.filePath || this.product?.images[0].filePath
    } 
    this.router.navigate(['/checkout'],
      {
        queryParams: queryParams
      });
  }

  addToWishlist(): void {
    if (!this.product) return;
    // TODO: Implement wishlist functionality
    this.messageService.add({
      severity: 'info',
      summary: 'Coming Soon',
      detail: 'Wishlist functionality is coming soon!',
      life: 1000
    });
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

  navigateToProduct(product: IProduct): void {
    this.router.navigate(['/products', product._id]);
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
}
