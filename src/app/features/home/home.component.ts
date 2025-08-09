import { AfterViewChecked, AfterViewInit, Component, inject, OnInit } from '@angular/core';
import { CommonModule, CurrencyPipe } from '@angular/common';
import { ProductService } from '../products/services/product.service';
import { IProduct } from '../products/models/product.interface';
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { RatingModule } from 'primeng/rating';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { MessageService } from 'primeng/api';
import { ToastModule } from 'primeng/toast';
import { TooltipModule } from 'primeng/tooltip';
import { CartService } from '../cart/services/cart.service';
import { WishlistService } from '../wishlist/services/wishlist.service';
import { BaseResponse, pagination } from '../../core/models/baseResponse';
import { GalleriaComponent } from "../../shared/components/galleria/galleria.component";
import { CarouselComponent } from "../../shared/components/carousel/carousel.component";
import { CategoryService } from '../products/services/category.service';
import { ICategory } from '../../interfaces/category.interface';
import { environment } from '../../../environments/environment';
import AOS from 'aos';

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

export class HomeComponent implements OnInit, AfterViewInit, AfterViewChecked {
  featuredProducts: IProduct[] = [];
  newArrivals: IProduct[] = [];
  categories: ICategory[] = [];
  loading = true;
  loadingCategories = true;
  domain = environment.domain;  
  router = inject(Router);
  aosInitialized = false;
  constructor(
    private productService: ProductService,
    private cartService: CartService,
    private wishlistService: WishlistService,
    private messageService: MessageService,
    private categoryService: CategoryService
  ) {}

  ngOnInit() {
    this.loadFeaturedProducts();
    this.loadNewArrivals();
    this.loadCategories();
  }
  ngAfterViewInit(): void {
    AOS.init({
      duration: 3000,
      easing: 'ease-out-cubic',
      once: true,
      offset: 60,
      delay: 200,
    });
    this.aosInitialized = true;
  }
  ngAfterViewChecked(): void {
    // إعادة تحديث AOS لما العناصر تتغير
    if (this.aosInitialized) {
      AOS.refresh();
      AOS.refreshHard();
    }
  }
  private loadCategories() {
    this.categoryService.listCategories().subscribe({
      next: (response: BaseResponse<ICategory[]>) => {
        this.categories = response.data;
        this.loadingCategories = false;
      },
      error: (error) => {
        console.error('Error loading categories:', error);
        this.loadingCategories = false;
      }
    });
  }

  navigateToProductList(categoryId?: string) {
    this.router.navigate(['/shop'], { queryParams: { category: categoryId } });
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
    return `/shop/${product._id}`;
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
      productId: product._id,
      quantity: 1,
      price: product.price,
      color: product.variants?.[0]?.attributes?.[0]?.variant === 'color' ? product.variants?.[0]?.attributes?.[0]?.value : '',
      size: product.variants?.[0]?.attributes?.[0]?.variant === 'size' ? product.variants?.[0]?.attributes?.[0]?.value : '',
      image: product.images[0].filePath,
      productName: product.name,
      discount: product.discountPrice || 0,
    });
    this.messageService.add({
      severity: 'success',
      summary: 'Added to Cart',
      detail: `${product.name} has been added to your cart.`
    });
  }

}
