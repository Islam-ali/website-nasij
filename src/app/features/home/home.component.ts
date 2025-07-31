import { Component, OnInit } from '@angular/core';
import { CommonModule, CurrencyPipe } from '@angular/common';
import { ProductService } from '../products/services/product.service';
import { IProduct } from '../products/models/product.interface';
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { RatingModule } from 'primeng/rating';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { MessageService } from 'primeng/api';
import { ToastModule } from 'primeng/toast';
import { TooltipModule } from 'primeng/tooltip';
import { CartService } from '../cart/services/cart.service';
import { WishlistService } from '../wishlist/services/wishlist.service';
import { BaseResponse, pagination } from '../../core/models/baseResponse';
import { GalleriaComponent } from "../../shared/components/galleria/galleria.component";
import { CarouselComponent } from "../../shared/components/carousel/carousel.component";

interface ICategory {
  id: string;
  name: string;
  image: string;
  slug: string;
}

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [
    CommonModule,
    CardModule,
    ButtonModule,
    RatingModule,
    FormsModule,
    RouterModule,
    ProgressSpinnerModule,
    ToastModule,
    TooltipModule,
    GalleriaComponent,
    CarouselComponent,
],
  providers: [
    MessageService,
    CurrencyPipe
  ],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})

export class HomeComponent implements OnInit {
  featuredProducts: IProduct[] = [];
  newArrivals: IProduct[] = [];
  categories: ICategory[] = [
    { id: 'electronics', name: 'Electronics', image: 'assets/images/categories/electronics.jpg', slug: 'electronics' },
    { id: 'clothing', name: 'Clothing', image: 'assets/images/categories/clothing.jpg', slug: 'clothing' },
    { id: 'home', name: 'Home & Living', image: 'assets/images/categories/home.jpg', slug: 'home' },
    { id: 'books', name: 'Books', image: 'assets/images/categories/books.jpg', slug: 'books' },
  ];
  loading = true;

  constructor(
    private productService: ProductService,
    private cartService: CartService,
    private wishlistService: WishlistService,
    private messageService: MessageService
  ) {}

  ngOnInit() {
    this.loadFeaturedProducts();
    this.loadNewArrivals();
  }

  private loadFeaturedProducts() {
    this.productService.getFeaturedProducts().subscribe({
      next: (response:BaseResponse<IProduct[]>) => {
        this.featuredProducts = response.data;
        this.checkLoading();
      },
      error: (error) => {
        console.error('Error loading featured products:', error);
        this.checkLoading();
      }
    });
  }

  private loadNewArrivals() {
    this.productService.getNewArrivals().subscribe({
      next: (response:BaseResponse<{products: IProduct[], pagination: pagination}>) => {
        this.newArrivals = response.data.products;
        this.checkLoading();
      },
      error: (error) => {
        console.error('Error loading new arrivals:', error);
        this.checkLoading();
      }
    });
  }

  private checkLoading() {
    if (this.featuredProducts.length > 0 || this.newArrivals.length > 0) {
      this.loading = false;
    }
  }

  getProductUrl(product: IProduct): string {
    return `/products/${product.id}`;
  }

  private slugify(text: string): string {
    return text.toString().toLowerCase()
      .replace(/\s+/g, '-')           // Replace spaces with -
      .replace(/[^\w\-]+/g, '')       // Remove all non-word chars
      .replace(/\-\-+/g, '-')         // Replace multiple - with single -
      .replace(/^-+/, '')             // Trim - from start of text
      .replace(/-+$/, '');            // Trim - from end of text
  }

  addToCart(product: IProduct): void {
    this.cartService.addToCart({
      productId: product.id,
      quantity: 1,
      price: product.price,
      color: product.colors?.[0] || '',
      size: product.size?.[0] || '',
    });
    this.messageService.add({
      severity: 'success',
      summary: 'Added to Cart',
      detail: `${product.name} has been added to your cart.`
    });
  }

  addToWishlist(product: IProduct): void {
    this.wishlistService.addToWishlist({
      productId: product.id,
      
    }).subscribe({
      next: () => {
        this.messageService.add({
          severity: 'success',
          summary: 'Added to Wishlist',
          detail: `${product.name} has been added to your wishlist.`
        });
      },
      error: (error) => {
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: error.message || 'Failed to add to wishlist.'
        });
      }
    });
  }

}
