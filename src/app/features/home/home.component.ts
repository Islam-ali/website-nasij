import { AfterViewChecked, AfterViewInit, Component, inject, OnInit } from '@angular/core';
import { CommonModule, CurrencyPipe } from '@angular/common';
import { ProductService } from '../products/services/product.service';
import { EnumProductVariant, IProduct } from '../products/models/product.interface';
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
import { CarouselComponent } from "../../shared/components/carousel/carousel.component";
import { CategoryService } from '../products/services/category.service';
import { ICategory } from '../../interfaces/category.interface';
import { environment } from '../../../environments/environment';
import AOS from 'aos';
import { HeroSectionComponent } from "./hero-section/hero-section.component";
import { FeaturedCollectionComponent } from "./featured-collection/featured-collection.component";
import { BannarComponent } from "./bannar/bannar.component";
import { FeatureComponent } from "./feature/feature.component";
import { PackageService } from '../packages/services/package.service';
import { IPackage } from '../../interfaces/package.interface';
import { TranslationService } from '../../core/services/translate.service';
import { TranslateModule } from '@ngx-translate/core';
import { MultiLanguagePipe } from '../../core/pipes/multi-language.pipe';
import { MultilingualText } from '../../core/models/multi-language';

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
    CarouselComponent,
    HeroSectionComponent,
    FeaturedCollectionComponent,
    BannarComponent,
    FeatureComponent,
    TranslateModule,
    MultiLanguagePipe
],
  providers: [
    MessageService,
    CurrencyPipe
  ],
  templateUrl: './home.component.html',
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
  packages: IPackage[] = [];
  constructor(
    private productService: ProductService,
    private cartService: CartService,
    private wishlistService: WishlistService,
    private messageService: MessageService,
    private categoryService: CategoryService,
    private packageService: PackageService,
    private translationService: TranslationService
  ) {}

  ngOnInit() {
    this.loadFeaturedProducts();
    this.loadNewArrivals();
    this.loadCategories();
    this.loadPackages();
  }
  ngAfterViewInit(): void {
    AOS.init({
      duration: 800,
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

  private loadPackages() {
    this.packageService.getPackages().subscribe({
      next: (response: BaseResponse<IPackage[]>) => {
        this.packages = response.data;
      }
    });
  }

  getCategoryGridClass(index: number): string {
    const gridClasses = [
      'sm:col-span-2 lg:col-span-4 lg:row-span-2', // 0 - Large
      'sm:col-span-1 lg:col-span-3 lg:row-span-1', // 1 - Medium
      'sm:col-span-1 lg:col-span-3 lg:row-span-1', // 2 - Medium
      'sm:col-span-2 lg:col-span-6 lg:row-span-1', // 3 - Wide
      'sm:col-span-1 lg:col-span-3 lg:row-span-1', // 4 - Medium
      'sm:col-span-1 lg:col-span-3 lg:row-span-1', // 5 - Medium
      'sm:col-span-2 lg:col-span-4 lg:row-span-2', // 6 - Large
      'sm:col-span-1 lg:col-span-3 lg:row-span-1', // 7 - Medium
      'sm:col-span-1 lg:col-span-3 lg:row-span-1', // 8 - Medium
      'sm:col-span-2 lg:col-span-6 lg:row-span-1', // 9 - Wide
    ];

    if (index < gridClasses.length) {
      return gridClasses[index];
    } else {
      // For categories beyond index 9, use a repeating pattern
      return 'sm:col-span-1 lg:col-span-3 lg:row-span-1';
    }
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
  navigateToPackage(pkg: any) {
    this.router.navigate(['/packages', pkg._id]);
  }
  navigateToProduct(product: any) {
    this.router.navigate(['/shop', product._id, this.slugify(product.name)]);
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
      color: product.variants?.[0]?.attributes?.[0]?.variant === EnumProductVariant.COLOR ? (product.variants?.[0]?.attributes?.[0]?.value as unknown as MultilingualText) : null,
      size: product.variants?.[0]?.attributes?.[0]?.variant === EnumProductVariant.SIZE ? (product.variants?.[0]?.attributes?.[0]?.value as unknown as MultilingualText) : null,
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
