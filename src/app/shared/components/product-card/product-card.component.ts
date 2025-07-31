import { Component, Inject, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';

// PrimeNG Modules
import { ButtonModule } from 'primeng/button';
import { TooltipModule } from 'primeng/tooltip';
import { RippleModule } from 'primeng/ripple';
import { RatingModule } from 'primeng/rating';
import { MessageModule } from 'primeng/message';
import { MessageService } from 'primeng/api';

// Services
import { WishlistService } from '../../../features/wishlist/services/wishlist.service';
import { CartService } from '../../../features/cart/services/cart.service';
import { IProduct } from '../../../interfaces/product.interface';
import { environment } from '../../../../environments/environment';
// Models


// Add this interface for window with a custom property
declare global {
  interface Window {
    // Add any custom properties you need to access on the window object
  }
}

@Component({
  selector: 'app-product-card',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    FormsModule,
    ButtonModule,
    TooltipModule,
    RippleModule,
    RatingModule,
    MessageModule
  ],
  providers: [
    WishlistService,
    CartService,
    MessageService,
    { provide: Window, useValue: window }
  ],
  templateUrl: './product-card.component.html',
  styleUrls: ['./product-card.component.scss']
})
export class ProductCardComponent implements OnInit {
  @Input() product!: IProduct;
  @Input() showActions = true;
  @Input() showWishlist = true;
  @Input() showAddToCart = true;
  @Input() showViewDetails = true;
  
  quantity = 1;
  isInWishlist = false;
  loading = false;
  domain = environment.domain;
  
  get isOnSale(): boolean {
    return this.product.price > 0 && this.product.price > this.product.price;
  }
  
  get price(): number {
    return this.product.price;
  }
  
  get discountPercentage(): number {
    if (!this.isOnSale) return 0;
    return Math.round(((this.product.price - this.product.price) / this.product.price) * 100);
  }

  constructor(
    private wishlistService: WishlistService,
    private cartService: CartService,
    private messageService: MessageService,
    private router: Router,
    @Inject(Window) private window: Window
  ) {}

  // Get product image with fallback to placeholder
  getProductImage(product: IProduct): string {
    return `${this.domain}/${product?.images?.[0].filePath}` || 'assets/images/placeholder.png';
  }

  // Handle image loading errors
  handleImageError(event: Event): void {
    const imgElement = event.target as HTMLImageElement;
    imgElement.src = 'assets/images/placeholder.png';
  }
  
  // Handle rating changes
  onRate(event: any): void {
    // Handle rating changes if needed
    console.log('Rating changed:', event.value);
  }
  
  // Toggle product wishlist status
  // toggleWishlist(event: Event): void {
  //   event.stopPropagation();
  //   this.loading = true;
    
  //   if (this.isInWishlist) {
  //     this.wishlistService.removeFromWishlist(this.product._id).subscribe({
  //       next: () => {
  //         this.isInWishlist = false;
  //         this.loading = false;
  //         this.messageService.add({
  //           severity: 'success',
  //           summary: 'Success',
  //           detail: 'Removed from wishlist'
  //         });
  //       },
  //       error: (error) => {
  //         console.error('Error removing from wishlist:', error);
  //         this.loading = false;
  //         this.messageService.add({
  //           severity: 'error',
  //           summary: 'Error',
  //           detail: 'Failed to remove from wishlist'
  //         });
  //       }
  //     });
  //   } else {
  //     this.wishlistService.addToWishlist(this.product._id).subscribe({
  //       next: () => {
  //         this.isInWishlist = true;
  //         this.loading = false;
  //         this.messageService.add({
  //           severity: 'success',
  //           summary: 'Success',
  //           detail: 'Added to wishlist'
  //         });
  //       },
  //       error: (error) => {
  //         console.error('Error adding to wishlist:', error);
  //         this.loading = false;
  //         this.messageService.add({
  //           severity: 'error',
  //           summary: 'Error',
  //           detail: 'Failed to add to wishlist'
  //         });
  //       }
  //     });
  //   }
  // }
  navigateToProduct(product: IProduct): void {
    this.router.navigate(['/products', product._id]);
  }
  
  ngOnInit(): void {
    // Check if product is in wishlist
    if (this.product) {
      // this.wishlistService.isInWishlist(this.product._id || '').subscribe({
      //   next: (isInWishlist: boolean) => {
      //     this.isInWishlist = isInWishlist;
      //   },
      //   error: (error: any) => {
      //     console.error('Error checking wishlist status:', error);
      //   }
      // });
    }
  }

  toggleWishlist(event: Event): void {
    event.preventDefault();
    event.stopPropagation();
    
    if (this.loading) return;
    
    this.loading = true;
    
    if (this.isInWishlist) {
      // Remove from wishlist
      this.wishlistService.removeFromWishlist(
        this.product.id,
        this.product.variants[0]._id
      ).subscribe({
        next: () => {
          this.isInWishlist = false;
          this.loading = false;
          this.messageService.add({
            severity: 'success',
            summary: 'Removed',
            detail: 'Product removed from wishlist'
          });
        },
        error: (error) => {
          console.error('Error removing from wishlist:', error);
          this.loading = false;
          this.messageService.add({
            severity: 'error',
            summary: 'Error',
            detail: 'Failed to remove from wishlist'
          });
        }
      });
    } else {
      // Add to wishlist
      this.wishlistService.addToWishlist({
        productId: this.product.id,
        variantId: this.product.variants[0]._id
      }).subscribe({
        next: () => {
          this.isInWishlist = true;
          this.loading = false;
          this.messageService.add({
            severity: 'success',
            summary: 'Added',
            detail: 'Product added to wishlist'
          });
        },
        error: (error) => {
          console.error('Error adding to wishlist:', error);
          this.loading = false;
          this.messageService.add({
            severity: 'error',
            summary: 'Error',
            detail: 'Failed to add to wishlist'
          });
        }
      });
    }
  }

  addToCart(event: Event): void {
    event.preventDefault();
    event.stopPropagation();
    
    if (this.loading) return;
    
    this.loading = true;
    
    this.cartService.addToCart({
      productId: this.product.id,
      price: this.product.variants[0].price,
      color: this.product.color?.[0] || '',
      size: this.product.size?.[0] || '',
      quantity: this.quantity
    }).subscribe({
      next: () => {
        this.loading = false;
        this.messageService.add({
          severity: 'success',
          summary: 'Added to Cart',
          detail: `${this.product.name} has been added to your cart`
        });
      },
      error: (error) => {
        console.error('Error adding to cart:', error);
        this.loading = false;
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Failed to add to cart'
        });
      }
    });
  }

  // // Helper to get the first variant price or product price
  // get price(): number {
  //   return this.product.variants[0].price || this.product.price || 0;
  // }

  // Helper to check if product is on sale
  // get isOnSale(): boolean {
  //   return this.product.price ? this.product.price > this.price : false;
  // }

  // // Calculate discount percentage
  // get discountPercentage(): number {
  //   if (!this.product.price) return 0;
  //   return Math.round(((this.product.price - this.price) / this.product.price) * 100);
  // }
}
