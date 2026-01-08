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

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterModule,
    CarouselComponent,
    HeroSectionComponent,
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
  featuredProducts: IProduct[] = [];
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
    this.updateSeo();
    this.loadFeaturedProducts();
    this.loadNewArrivals();
    this.loadCategories();
    this.loadPackages();
    this.getBusinessProfile();
  }

  private updateSeo(): void {
    const currentLang = this.translationService.getCurrentLanguage();
    const isArabic = currentLang === 'ar';
    
    const keywords = isArabic 
      ? 'Pledge, منتجات طلابية, استيكرز, براويز, بوكسات, طلاب الأزهر, طلاب الجامعات, طلاب علمي, طلاب أدبي, طلاب طب, منتجات ملهمة, هدايا طلابية, منتجات تعليمية, بوكس القرآن, مفكرات, قرطاسية, مصر, القاهرة'
      : 'Pledge, student products, stickers, frames, notebooks, Quran box, Al-Azhar students, university students, science students, literature students, medical students, inspirational products, study accessories, student gifts, educational products, Egypt, Cairo, student supplies, stationery';
    
    const title = isArabic
      ? 'Pledge - منتجات ملهمة للطلاب | استيكرز، براويز، بوكسات | طلاب الأزهر والجامعات'
      : 'Pledge - Inspiring Student Products | Stickers, Frames, Boxes | Al-Azhar & University Students';
    
    const description = isArabic
      ? 'في Pledge بنحوّل كل لحظة في رحلتك الدراسية لذكرى تعيش معاك. من استيكرز ملهمة، لبراويز أنيقة، لبوكسات مخصوصة لطلبة الأزهر وطلاب الجامعات (علمي علوم – أدبي – طب)، هتلاقي كل اللي بيعبر عنك في مكان واحد. منتجات طلابية عالية الجودة، هدايا ملهمة، وقرطاسية مميزة.'
      : 'At Pledge, we transform every moment of your academic journey into a lasting memory. From inspiring stickers, elegant frames, to special boxes for Al-Azhar students and university students (Science, Literature, Medicine), find everything that expresses you in one place. High-quality student products, inspiring gifts, and unique stationery.';

    this.seoService.updateSeo({
      title,
      description,
      keywords,
      canonicalUrl: 'https://www.pledgestores.com',
      ogType: 'website',
      locale: isArabic ? 'ar_EG' : 'en_US',
      alternateLocale: isArabic ? 'en_US' : 'ar_EG'
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
