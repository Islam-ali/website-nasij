import { AfterViewChecked, AfterViewInit, Component, inject, OnInit, PLATFORM_ID } from '@angular/core';
import { CommonModule, CurrencyPipe, isPlatformBrowser } from '@angular/common';
import { ProductService } from '../products/services/product.service';
import { IProduct } from '../products/models/product.interface';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { UiToastService } from '../../shared/ui';
import { CartService } from '../cart/services/cart.service';
import { BaseResponse, pagination } from '../../core/models/baseResponse';
import { CarouselComponent } from "../../shared/components/carousel/carousel.component";
import { CategoryService } from '../products/services/category.service';
import { ICategory } from '../../interfaces/category.interface';
import { environment } from '../../../environments/environment';
import { HeroSectionComponent } from "./hero-section/hero-section.component";
import { HeroLayoutComponent } from "./hero-layout/hero-layout.component";
import { FeaturedCollectionComponent } from "./featured-collection/featured-collection.component";
import { BannarComponent } from "./bannar/bannar.component";
import { FeatureComponent } from "./feature/feature.component";
import { ReviewsComponent } from "./reviews/reviews.component";
import { CategoriesComponent } from "./categories/categories.component";
import { ProductFeaturesComponent } from "./product-features/product-features.component";
import { PackageService } from '../packages/services/package.service';
import { IPackage } from '../../interfaces/package.interface';
import { TranslateModule } from '@ngx-translate/core';
import { MultiLanguagePipe } from '../../core/pipes/multi-language.pipe';
import { FallbackImgDirective } from '../../core/directives/fallback-img.directive';
import { BusinessProfileService } from '../../services/business-profile.service';
import { IBusinessProfile } from '../../interfaces/business-profile.interface';
import { SeoService } from '../../core/services/seo.service';
import { TranslationService } from '../../core/services/translate.service';
import { HeaderAlignment } from '../../interfaces/product-feature.interface';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterModule,
    CarouselComponent,
    HeroSectionComponent,
    HeroLayoutComponent,
    FeaturedCollectionComponent,
    CategoriesComponent,
    ProductFeaturesComponent,
    BannarComponent,
    FeatureComponent,
    ReviewsComponent,
    TranslateModule,
    MultiLanguagePipe,
    FallbackImgDirective
],
  providers: [
    CurrencyPipe
  ],
  templateUrl: './home.component.html',
})

export class HomeComponent implements OnInit, AfterViewInit, AfterViewChecked {
  newArrivals: IProduct[] = [];
  categories: ICategory[] = [];
  loading = true;
  loadingCategories = true;
  domain = environment.domain;  
  router = inject(Router);
  packages: IPackage[] = [];
  businessProfile: IBusinessProfile | null = null;
  platformId = inject(PLATFORM_ID);
  constructor(
    private productService: ProductService,
    private cartService: CartService,
    private toastService: UiToastService,
    private categoryService: CategoryService,
    private packageService: PackageService,
    private businessProfileService: BusinessProfileService,
    private seoService: SeoService,
    private translationService: TranslationService
  ) {}

  ngOnInit() {
    // this.loadFeaturedProducts();
    this.loadNewArrivals();
    this.loadCategories();
    this.loadPackages();
    this.getBusinessProfile();
    this.updateSeo();
  }

  getHeaderAlignmentClass(): string {
    const alignment = this.businessProfileService.businessProfile.value?.headerAlignment || HeaderAlignment.CENTER;
    switch (alignment) {
      case HeaderAlignment.START:
        return 'text-start items-start justify-start';
      case HeaderAlignment.END:
      return 'flex flex-col ' + alignment;
      case HeaderAlignment.CENTER:
      default:
        return 'text-center items-center justify-center';
    }
  } 
  
  private updateSeo(): void {
    // Get business profile from service
    this.businessProfileService.getBusinessProfile$().subscribe({
      next: (profile) => {
        if (profile) {
          const currentLang = this.translationService.getCurrentLanguage();
          const isArabic = currentLang === 'ar';
          
          // Get values from business profile
          const title = profile.metaTitle 
            ? (isArabic ? (profile.metaTitle.ar || profile.metaTitle.en) : (profile.metaTitle.en || profile.metaTitle.ar))
            : (isArabic ? profile.name.ar : profile.name.en);
          
          const description = profile.metaDescription 
            ? (isArabic ? (profile.metaDescription.ar || profile.metaDescription.en) : (profile.metaDescription.en || profile.metaDescription.ar))
            : (isArabic ? profile.description.ar : profile.description.en);
          
          const keywords = profile.metaKeywords && profile.metaKeywords.length > 0
            ? profile.metaKeywords.join(', ')
            : '';
          
          const canonicalUrl = profile.canonicalUrl || profile.baseUrl || '';
          
          this.seoService.updateSeo({
            title: title || '',
            description: description || '',
            keywords: keywords,
            canonicalUrl: canonicalUrl,
            ogType: 'website',
            locale: isArabic ? 'ar_EG' : 'en_US',
            alternateLocale: isArabic ? 'en_US' : 'ar_EG'
          }, profile);
        }
      }
    });
  }
  ngAfterViewInit(): void {
  }
  ngAfterViewChecked(): void {
  }
  private loadCategories() {
    this.categoryService.listCategories('active').subscribe({
      next: (response: BaseResponse<ICategory[]>) => {
        this.categories = response.data;
        this.loadingCategories = false;
      },
      error: (error) => {
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

  // getCategoryGridClass(index: number): string {
  //   const gridClasses = [
  //     'sm:col-span-2 lg:col-span-4 lg:row-span-2', // 0 - Large
  //     'sm:col-span-1 lg:col-span-3 lg:row-span-1', // 1 - Medium
  //     'sm:col-span-1 lg:col-span-3 lg:row-span-1', // 2 - Medium
  //     'sm:col-span-2 lg:col-span-6 lg:row-span-1', // 3 - Wide
  //     'sm:col-span-1 lg:col-span-3 lg:row-span-1', // 4 - Medium
  //     'sm:col-span-1 lg:col-span-3 lg:row-span-1', // 5 - Medium
  //     'sm:col-span-2 lg:col-span-4 lg:row-span-2', // 6 - Large
  //     'sm:col-span-1 lg:col-span-3 lg:row-span-1', // 7 - Medium
  //     'sm:col-span-1 lg:col-span-3 lg:row-span-1', // 8 - Medium
  //     'sm:col-span-2 lg:col-span-6 lg:row-span-1', // 9 - Wide
  //   ];

  //   if (index < gridClasses.length) {
  //     return gridClasses[index];
  //   } else {
  //     // For categories beyond index 9, use a repeating pattern
  //     return 'sm:col-span-1 lg:col-span-3 lg:row-span-1';
  //   }
  // }

  navigateToProductList(categoryId?: string) {
    this.router.navigate(['/shop'], { queryParams: { category: categoryId } });
  }

  // private loadFeaturedProducts() {
  //   this.productService.getFeaturedProducts().subscribe({
  //     next: (response:BaseResponse<IProduct[]>) => {
  //       this.featuredProducts = response.data;
  //       this.checkLoading();
  //     },
  //     error: (error) => {
  //       console.error('Error loading featured products:', error);
  //       this.checkLoading();
  //     }
  //   });
  // }

  private loadNewArrivals() {
    this.productService.getNewArrivals().subscribe({
      next: (response:BaseResponse<{products: IProduct[], pagination: pagination}>) => {
        this.newArrivals = response.data.products;
        this.checkLoading();
      },
      error: (error) => {
        this.checkLoading();
      }
    });
  }

  private checkLoading() {
    if (this.newArrivals.length > 0) {
      this.loading = false;
    }
  }
  navigateToPackage(pkg: any) {
    this.router.navigate(['/packages', pkg._id]);
  }
  navigateToProduct(product: any) {
    this.router.navigate(['/shop', product._id, this.slugify(product.name.en)]);
  }
  navigateToCategory(category: ICategory) {
    this.router.navigate(['/shop'], { queryParams: { category: category._id } });
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
      selectedVariants: product.variants?.[0]?.attributes || [],
      image: `${this.domain}/${product.images[0].filePath}`,
      productName: product.name,
      discount: product.discountPrice || 0,
    });
    this.toastService.success(`${product.name} has been added to your cart.`, 'Added to Cart');
  }

  getBusinessProfile() {
    this.businessProfileService.getBusinessProfile$().subscribe({
      next: (businessProfile) => {
        this.businessProfile = businessProfile;
      }
    });
  }

}
