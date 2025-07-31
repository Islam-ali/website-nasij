import { Component, OnInit, OnDestroy, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { Subscription, forkJoin, of } from 'rxjs';
import { switchMap, takeUntil, tap } from 'rxjs/operators';

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
import { IProduct } from '../models/product.interface';
import { ProductService } from '../services/product.service';
import { WishlistService } from '../../wishlist/services/wishlist.service';
import { CartService } from '../../cart/services/cart.service';
import { environment } from '../../../../environments/environment';
import { IVariant } from '../models/variant.interface';
import { TabsModule } from 'primeng/tabs';
import { Card } from "primeng/card";
import { BaseResponse, pagination } from '../../../core/models/baseResponse';
import { AccordionModule } from 'primeng/accordion';
import { BaseComponent } from 'primeng/basecomponent';
import { ComponentBase } from '../../../core/directives/component-base.directive';
import { IAddToCartRequest } from '../../cart/models/cart.interface';

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
    Card,
    AccordionModule,
  ],
  templateUrl: './product-details.component.html',
  styleUrls: ['./product-details.component.scss']
})
export class ProductDetailsComponent extends ComponentBase implements OnInit {
  @ViewChild('galleryImage') galleryImage!: ElementRef;
  currentImageIndex: number = 0;
  selectedColor: string | null = null;
  selectedSize: string | null = null;
  selectedVariant: IVariant | null = null;
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

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private productService: ProductService,
    private wishlistService: WishlistService,
    private cartService: CartService,
    private messageService: MessageService
  ) { 
    super();
    this.responsiveOptions = [
      {
        breakpoint: '1024px',
        numVisible: 5
      },
      {
        breakpoint: '768px',
        numVisible: 3
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


  isVariantSelected(variant: any): boolean {
    return variant?._id === this.selectedVariant?._id;
  }
  toggleWishlist(): void {
    if (!this.product) return;
    this.wishlistLoading = true;
    this.isInWishlist = !this.isInWishlist;
    setTimeout(() => {
      this.wishlistLoading = false;
    }, 1000);
    // this.wishlistService.toggleWishlist(this.product.id, this.selectedVariant?._id).subscribe({
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
          this.loadRelatedProducts(this.product.id);
          this.checkWishlistStatus();
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
          alt: this.product?.name || '',
          title: this.product?.name || ''
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
    return `${environment.domain}${imagePath}`;
  }

  getDiscountPercentage(price: number, compareAtPrice?: number): number | null {
    if (compareAtPrice && compareAtPrice > price) {
      return Math.round(((compareAtPrice - price) / compareAtPrice) * 100);
    }
    return null;
  }

  onVariantSelect(variant: any): void {
    this.selectedVariant = variant;
    this.quantity = 1; // Reset quantity when variant changes
    this.checkWishlistStatus();
  }

  private checkWishlistStatus(): void {
    if (!this.product) return;

    this.isInWishlist = this.wishlistService.isInWishlist(
      this.product.id,
      this.selectedVariant?._id
    );
  }

  addToCart(): void {
    if (!this.product) return;

    const productToAdd:IAddToCartRequest = {
      productId: this.product.id,
      price: this.selectedVariant?.price || this.product.price,
      quantity: this.quantity,
      color: this.selectedColor || '',
      size: this.selectedSize || '',
    };

    this.cartService.addToCart(productToAdd);

    this.messageService.add({
      severity: 'success',
      summary: 'Added to Cart',
      detail: `${this.quantity} x ${this.product.name} has been added to your cart`,
      life: 3000
    });
  }

  addToWishlist(): void {
    if (!this.product) return;
    // TODO: Implement wishlist functionality
    this.messageService.add({
      severity: 'info',
      summary: 'Coming Soon',
      detail: 'Wishlist functionality is coming soon!',
      life: 3000
    });
  }

  increaseQuantity(): void {
    const maxQuantity = this.selectedVariant?.stock || this.product?.stock || 10;
    if (this.quantity < maxQuantity) {
      this.quantity++;
    }
  }

  decreaseQuantity(): void {
    if (this.quantity > 1) {
      this.quantity--;
    }
  }

  onQuantityChange(event: any): void {
    const value = parseInt(event.target.value, 10);
    if (!isNaN(value) && value > 0) {
      const maxQuantity = this.selectedVariant?.stock || this.product?.stock || 10;
      this.quantity = Math.min(value, maxQuantity);
    } else {
      this.quantity = 1;
    }
  }

  navigateToProduct(product: IProduct): void {
    this.router.navigate(['/products', product.id]);
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
}
