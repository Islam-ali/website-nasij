import { Component, OnInit, OnDestroy, AfterViewInit, AfterViewChecked, Inject, PLATFORM_ID, signal, computed } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { Router, RouterModule, ActivatedRoute } from '@angular/router';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup } from '@angular/forms';
import { Subscription } from 'rxjs';
import { ProductService } from '../services/product.service';
import { CategoryService } from '../services/category.service';
import { BrandService } from '../services/brand.service';
import { BaseResponse, pagination } from '../../../core/models/baseResponse';
import { IBrand } from '../models/brand.interface';
import { ProductCardComponent } from "../../../shared/components/product-card/product-card.component";
import { IProductQueryParams } from '../models/product.interface';
import { ICategory } from '../../../interfaces/category.interface';
import { IProduct } from '../models/product.interface';
import { TranslateModule } from '@ngx-translate/core';
import { TranslationService } from '../../../core/services/translate.service';
import { MultiLanguagePipe } from '../../../core/pipes/multi-language.pipe';
import { environment } from '../../../../environments/environment';
import { SeoService } from '../../../core/services/seo.service';
import { 
  UiToastService, 
  UiButtonComponent, 
  UiChipComponent, 
  UiPaginationComponent, 
  UiDividerComponent
} from '../../../shared/ui';

@Component({
  selector: 'app-product-list',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    FormsModule,
    ReactiveFormsModule,
    ProductCardComponent,
    TranslateModule,
    MultiLanguagePipe,
    UiButtonComponent,
    UiChipComponent,
    UiPaginationComponent,
    UiDividerComponent,
  ],
  providers: [ProductService, CategoryService, BrandService, FormBuilder, TranslateModule],
  templateUrl: './product-list.component.html',
  styleUrls: ['./product-list.component.scss'],
})
export class ProductListComponent implements OnInit, OnDestroy, AfterViewInit, AfterViewChecked {
  products: IProduct[] = [];
  loading = true;
  error: string | null = null;
  domain = environment.domain;
  // Pagination
  totalRecords = 0;
  rows = 12;
  first = 0;

  // Filters
  categories: ICategory[] = [];
  brands: IBrand[] = [];
  sizes: string[] = [];
  colors: string[] = [];
  filterForm: FormGroup;
  isDrawerOpen = false;
  sortOptions: { labelKey: string; value: string }[] = [
    { labelKey: 'products.sort_options.featured', value: 'featured' },
    { labelKey: 'products.sort_options.newest_first', value: 'createdAt,desc' },
    { labelKey: 'products.sort_options.price_low_to_high', value: 'price,asc' },
    { labelKey: 'products.sort_options.price_high_to_low', value: 'price,desc' },
    { labelKey: 'products.sort_options.highest_rated', value: 'averageRating,desc' },
    { labelKey: 'products.sort_options.name_a_to_z', value: 'name,asc' },
  ];
  wishlistLoading = false;
  private subscriptions = new Subscription();

  constructor(
    private productService: ProductService,
    private categoryService: CategoryService,
    private brandService: BrandService,
    private router: Router,
    private route: ActivatedRoute,
    private fb: FormBuilder,
    @Inject(PLATFORM_ID) private platformId: Object,
    private translationService: TranslationService,
    private toastService: UiToastService,
    private seoService: SeoService
  ) {
    this.filterForm = this.fb.group({
      searchQuery: [''],
      selectedCategories: [[]],
      selectedBrands: [[]],
      sortBy: ['featured'],
    });
  }

  ngAfterViewInit(): void {
  }

  ngAfterViewChecked(): void {
  }

  ngOnInit(): void {
    this.updateSeo();
    this.loadCategories();
    this.loadBrands();
    this.loadSizesAndColors();
    // this.loadProducts();
    this.filterForm.valueChanges.subscribe(() => this.onFilterChange());
    
    // Subscribe to query parameter changes
    this.subscriptions.add(
      this.route.queryParams.subscribe(params => {
        this.updateFiltersFromQueryParams(params);
        this.updateSeo(); // Update SEO when filters change
      })
    );
  }

  private updateSeo(): void {
    const currentLang = this.translationService.getCurrentLanguage();
    const isArabic = currentLang === 'ar';
    const searchQuery = this.filterForm.get('searchQuery')?.value || '';
    const categoryId = this.route.snapshot.queryParams['category'];
    
    let keywords = isArabic 
      ? 'منتجات طلابية, استيكرز, براويز, بوكسات, طلاب الأزهر, طلاب الجامعات, منتجات ملهمة, هدايا طلابية, قرطاسية, مصر'
      : 'student products, stickers, frames, boxes, Al-Azhar students, university students, inspirational products, student gifts, stationery, Egypt';
    
    if (searchQuery) {
      keywords += `, ${searchQuery}`;
    }
    
    const title = isArabic
      ? searchQuery 
        ? `نتائج البحث عن "${searchQuery}" - منتجات طلابية | Pledge`
        : 'اكتشف منتجاتنا - استيكرز، براويز، بوكسات | Pledge'
      : searchQuery
        ? `Search Results for "${searchQuery}" - Student Products | Pledge`
        : 'Discover Our Products - Stickers, Frames, Boxes | Pledge';
    
    const description = isArabic
      ? searchQuery
        ? `اكتشف مجموعة واسعة من المنتجات الطلابية: استيكرز ملهمة، براويز أنيقة، بوكسات مخصوصة. ${searchQuery ? `نتائج البحث عن: ${searchQuery}` : ''} منتجات عالية الجودة لطلاب الأزهر والجامعات.`
        : 'اكتشف مجموعة واسعة من المنتجات الطلابية: استيكرز ملهمة، براويز أنيقة، بوكسات مخصوصة لطلاب الأزهر والجامعات. منتجات عالية الجودة وهدايا ملهمة.'
      : searchQuery
        ? `Discover a wide range of student products: inspiring stickers, elegant frames, special boxes. ${searchQuery ? `Search results for: ${searchQuery}` : ''} High-quality products for Al-Azhar and university students.`
        : 'Discover a wide range of student products: inspiring stickers, elegant frames, special boxes for Al-Azhar and university students. High-quality products and inspiring gifts.';

    const canonicalUrl = searchQuery || categoryId
      ? `https://www.pledgestores.com/shop${searchQuery ? `?search=${encodeURIComponent(searchQuery)}` : ''}${categoryId ? `?category=${categoryId}` : ''}`
      : 'https://www.pledgestores.com/shop';

    this.seoService.updateSeo({
      title,
      description,
      keywords,
      canonicalUrl,
      ogType: 'website',
      locale: isArabic ? 'ar_EG' : 'en_US',
      alternateLocale: isArabic ? 'en_US' : 'ar_EG'
    });
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }

  loadProducts(): void {
    this.loading = true;
    this.error = null;

    const { searchQuery, selectedCategories, selectedBrands, selectedSizes, selectedColors, minPrice, maxPrice, minRating, showOnSale, sortBy } =
      this.filterForm.value;

    const [sortField, sortOrder] = sortBy === 'featured' ? ['createdAt', 'desc'] : sortBy.split(',');

    const params: IProductQueryParams = {
      page: Math.floor(this.first / this.rows) + 1,
      limit: this.rows,
      category: selectedCategories,
      brand: selectedBrands,
      sortBy: sortField,
      sortOrder: sortOrder as 'asc' | 'desc',
      search: searchQuery || undefined,
      inStock: showOnSale ? true : undefined,
    };


    this.subscriptions.add(
      this.productService.getProducts(params).subscribe({
        next: (response: BaseResponse<{ products: IProduct[]; pagination: pagination }>) => {
          this.products = response.data.products;
          this.totalRecords = response.data.pagination.total;
          this.loading = false;
          this.error = null;
          // scroll to top if change page
          if (this.first !== 0) {
            this.scrollToTop();
          }
        },
        error: () => {
          this.error = 'Failed to load products. Please try again later.';
          this.toastService.error(this.error, 'Error');
          this.loading = false;
        },
      })
    );
  }

  loadCategories(): void {
    this.subscriptions.add(
      this.categoryService.getCategories().subscribe({
        next: (response: BaseResponse<{ categories: ICategory[]; pagination: pagination }>) => {
          this.categories = response.data.categories;
        },
        error: (err) => {
          this.toastService.error('Failed to load categories.', 'Error');
        },
      })
    );
  }

  loadBrands(): void {
    this.subscriptions.add(
      this.brandService.getBrands().subscribe({
        next: (response: BaseResponse<{ brands: IBrand[]; pagination: pagination }>) => {
          this.brands = response.data.brands;
        },
        error: (err) => {
          this.toastService.error('Failed to load brands.', 'Error');
        },
      })
    );
  }

  loadSizesAndColors(): void {
    this.subscriptions.add(
      this.productService.getProducts({ limit: 100 }).subscribe({
        next: (response: BaseResponse<{ products: IProduct[]; pagination: pagination }>) => {
          this.sizes = [...new Set(response.data.products.flatMap((p) => p.variants?.flatMap((v) => v.attributes?.filter((a) => a.variant === 'size').map((a) => a.value.en) || [])) || [])];
          this.colors = [...new Set(response.data.products.flatMap((p) => p.variants?.flatMap((v) => v.attributes?.filter((a) => a.variant === 'color').map((a) => a.value.en) || [])) || [])];
        },
        error: (err) => {
        },
      })
    );
  }

  changePage(next: boolean): void {
    const currentPage = Math.floor(this.first / this.rows);
    const totalPages = Math.max(Math.ceil(this.totalRecords / this.rows), 1);
    const targetPage = next ? Math.min(currentPage + 1, totalPages - 1) : Math.max(currentPage - 1, 0);
    if (targetPage === currentPage) {
      return;
    }
    this.first = targetPage * this.rows;
    this.loadProducts();
  }

  goToPage(page: number): void {
    const totalPages = Math.max(Math.ceil(this.totalRecords / this.rows), 1);
    if (page < 0 || page >= totalPages) {
      return;
    }
    this.first = page * this.rows;
    this.loadProducts();
  }

  onRowsChange(rows: number): void {
    this.rows = rows;
    this.first = 0;
    this.loadProducts();
  }

  onSortChange(): void {
    this.first = 0;
    this.loadProducts();
  }

  onPageChange(event: { first: number; rows: number; page: number; pageCount: number }): void {
    this.first = event.first;
    this.rows = event.rows;
    this.loadProducts();
  }

  onFilterChange(): void {
    this.first = 0;
    this.loadProducts();
    this.updateQueryParams();
  }

  updateQueryParams(): void {
    const { searchQuery, selectedCategories, selectedBrands, selectedSizes, selectedColors, minPrice, maxPrice, minRating, showOnSale, sortBy } = this.filterForm.value;
    
    const queryParams: any = {};
    
    if (searchQuery) queryParams.search = searchQuery;
    if (selectedCategories.length > 0) queryParams.category = selectedCategories.join(',');
    if (selectedBrands.length > 0) queryParams.brand = selectedBrands.join(',');
    if (sortBy !== 'featured') queryParams.sortBy = sortBy;
    
    // Update URL without reloading the page
    // this.router.navigate([], {
    //   relativeTo: this.route,
    //   queryParams,
    //   queryParamsHandling: 'merge',
    //   replaceUrl: true
    // });
  }

  toggleSelection(controlName: string, value: string, checked: boolean): void {
    const control = this.filterForm.get(controlName);
    if (!control) {
      return;
    }
    const current: string[] = control.value || [];
    if (checked) {
      if (!current.includes(value)) {
        control.setValue([...current, value]);
      }
    } else {
      control.setValue(current.filter(v => v !== value));
    }
    control.markAsDirty();
    this.onFilterChange();
  }

  onCategoryToggle(categoryId: string | undefined, event: Event): void {
    if (!categoryId) return;
    const target = event.target as HTMLInputElement;
    this.toggleSelection('selectedCategories', categoryId, target.checked);
  }

  onBrandToggle(brandId: string | undefined, event: Event): void {
    if (!brandId) return;
    const target = event.target as HTMLInputElement;
    this.toggleSelection('selectedBrands', brandId, target.checked);
  }

  private scrollToTop(): void {
    if (isPlatformBrowser(this.platformId)) {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }

  clearAllFilters(): void {
    this.filterForm.reset({
      searchQuery: '',
      selectedCategories: [],
      selectedBrands: [],
      sortBy: 'featured',
    });
    
    // Clear query parameters
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: {},
      replaceUrl: true
    });
    
    this.onFilterChange();
  }

  get activeFiltersCount(): number {
    const { selectedCategories, selectedBrands, selectedSizes, selectedColors, showOnSale, minRating, minPrice, maxPrice } =
      this.filterForm.value;
    return (
      selectedCategories.length +
      selectedBrands.length
    );
  }

  getDiscountPercentage(product: IProduct): number | null {
    if (product.discountPrice && product.price > product.discountPrice) {
      return Math.round(((product.price - product.discountPrice) / product.price) * 100);
    }
    return null;
  }

  getProductImage(product: IProduct): string {
    const imagePath = product.images?.[0]?.filePath;
    return imagePath ? `${this.domain}/${imagePath}` : 'assets/images/placeholder.png';
  }

  getColorStyle(color: string): string {
    const colorMap: { [key: string]: string } = {
      white: '#ffffff',
      black: '#000000',
      navy: '#000080',
      gray: '#808080',
      blue: '#0066cc',
      red: '#cc0000',
      brown: '#8B4513',
      tan: '#D2B48C',
      silver: '#C0C0C0',
      pink: '#FFC0CB',
      'light blue': '#ADD8E6',
      'rose gold': '#E8B4B8',
      'أسود': '#000000',
      'أبيض': '#ffffff',
      'أحمر': '#cc0000',
      'أزرق': '#0066cc',
      'أخضر': '#008000',
      'أصفر': '#ffff00',
      'أرجواني': '#800080',
      'بيج': '#f5f5f5',
    };
    return colorMap[color] || color;
  }

  addToCart(product: IProduct, event: Event): void {
    event.stopPropagation();
    this.toastService.success(`${product.name} added to cart.`, 'Added to Cart');
  }

  toggleWishlist(product: IProduct, event: Event): void {
    event.stopPropagation();
    this.wishlistLoading = !this.wishlistLoading;
    this.toastService.success(`${product.name} added to wishlist.`, 'Added to Wishlist');
  }

  trackByProductId(index: number, product: IProduct): string {
    return product?._id || '';
  }

  getCategoryName(categoryId: string): string {
    if (!this.categories) return 'Unknown Category';
    const category = this.categories.find(c => c._id === categoryId);
    return category?.name[this.currentLanguage] || category?.name.en || 'Unknown Category';
  }

  get currentLanguage(): 'en' | 'ar' {
    return this.translationService.getCurrentLanguage() as 'en' | 'ar';
  }

  getBrandName(brandId: string): string {
    if (!this.brands) return 'Unknown Brand';
    const brand = this.brands.find(b => b._id === brandId);
    return brand?.name[this.currentLanguage] || brand?.name.en || 'Unknown Brand';
  }

  removeCategoryFilter(categoryId: string): void {
    const currentCategories = this.filterForm.get('selectedCategories')?.value || [];
    this.filterForm.get('selectedCategories')?.setValue(
      currentCategories.filter((c: string) => c !== categoryId)
    );
    // remove category from query params
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: { ...this.route.snapshot.queryParams, category: undefined },
      queryParamsHandling: 'merge',
      replaceUrl: true
    });
    this.onFilterChange();
  }

  removeBrandFilter(brandId: string): void {
    const currentBrands = this.filterForm.get('selectedBrands')?.value || [];
    this.filterForm.get('selectedBrands')?.setValue(
      currentBrands.filter((b: string) => b !== brandId)
    );
    this.onFilterChange();
  }

  removeSizeFilter(size: string): void {
    const currentSizes = this.filterForm.get('selectedSizes')?.value || [];
    this.filterForm.get('selectedSizes')?.setValue(
      currentSizes.filter((s: string) => s !== size)
    );
    this.onFilterChange();
  }

  removeColorFilter(color: string): void {
    const currentColors = this.filterForm.get('selectedColors')?.value || [];
    this.filterForm.get('selectedColors')?.setValue(
      currentColors.filter((c: string) => c !== color)
    );
    this.onFilterChange();
  }

  getContrastColor(hexColor: string): string {
    // If the color is invalid, return black as default
    if (!hexColor || !/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/.test(hexColor)) {
      return '#000000';
    }

    // Convert hex to RGB
    const r = parseInt(hexColor.slice(1, 3), 16);
    const g = parseInt(hexColor.slice(3, 5), 16);
    const b = parseInt(hexColor.slice(5, 7), 16);

    // Calculate relative luminance (per ITU-R BT.709)
    const luminance = (0.2126 * r + 0.7152 * g + 0.0722 * b) / 255;

    // Return black for light colors, white for dark colors
    return luminance > 0.5 ? '#000000' : '#ffffff';
  }

  updateFiltersFromQueryParams(params: any): void {
    this.filterForm.patchValue({
      searchQuery: params['search'] || '',
      selectedCategories: params['category'] ? params['category'].split(',') : [],
      selectedBrands: params['brand'] ? params['brand'].split(',') : [],
      selectedSizes: params['size'] ? params['size'].split(',') : [],
      selectedColors: params['color'] ? params['color'].split(',') : [],
      minPrice: params['minPrice'] ? parseInt(params['minPrice']) : 0,
      maxPrice: params['maxPrice'] ? parseInt(params['maxPrice']) : 1000,
      minRating: params['minRating'] ? parseInt(params['minRating']) : 0,
      showOnSale: params['inStock'] === 'true' || params['inStock'] === true,
      sortBy: params['sortBy'] || 'featured',
    });
  }

  navigateToProduct(product: IProduct): void {
    this.router.navigate(['/shop', product._id, product.name.en]);
  }

  get totalPages(): number {
    return Math.max(Math.ceil((this.totalRecords || 0) / (this.rows || 1)), 1);
  }

  get currentPage(): number {
    return Math.min(Math.floor(this.first / this.rows) + 1, this.totalPages);
  }

  get selectedCategoryIds(): string[] {
    return this.filterForm.get('selectedCategories')?.value || [];
  }

  get selectedBrandIds(): string[] {
    return this.filterForm.get('selectedBrands')?.value || [];
  }

  isCategorySelected(categoryId: string): boolean {
    const selectedCategories = this.filterForm.get('selectedCategories')?.value || [];
    return selectedCategories.includes(categoryId);
  }

  isBrandSelected(brandId: string): boolean {
    const selectedBrands = this.filterForm.get('selectedBrands')?.value || [];
    return selectedBrands.includes(brandId);
  }

}