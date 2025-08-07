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

// Services
import { IProduct } from '../../../interfaces/product.interface';
import { environment } from '../../../../environments/environment';
import { WishlistService } from '../../../features/wishlist/services/wishlist.service';
import { MessageService } from 'primeng/api';
import { IAddToWishlistRequest } from '../../../features/wishlist/models/wishlist.interface';
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
    { provide: Window, useValue: window }
  ],
  templateUrl: './product-card.component.html',
  styleUrls: ['./product-card.component.scss']
})
export class ProductCardComponent implements OnInit {
  @Input() product!: IProduct;
  @Input() showViewDetails = true;
  
  quantity = 1;
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
    private router: Router,
    private wishlistService: WishlistService,
    private messageService: MessageService,
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
  
  navigateToProduct(product: IProduct): void {
    this.router.navigate(['/shop', product._id || product.id ,product.name]);
  }
  
  ngOnInit(): void {
    // Check if product is in wishlist
  }

  // add to wishlist
  addToWishlist(product: IProduct): void {
    this.loading = true;
    const wishlistItem: IAddToWishlistRequest = {
      productId: product.id,
      addedAt: new Date(),
      product: product
    };
    this.wishlistService.addToWishlist(wishlistItem).subscribe({
      next: () => {
        this.loading = false;
        this.messageService.add({ severity: 'success', summary: 'Added to Wishlist', detail: `${product.name} added to wishlist.` });
      },
      error: (error) => {
        this.loading = false;
        this.messageService.add({ severity: 'error', summary: 'Error', detail: error.message });
      }
    });
  }

}
