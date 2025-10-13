import { Component, OnInit, OnDestroy, AfterViewInit, AfterViewChecked, Inject, PLATFORM_ID, signal } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { Router, RouterModule, ActivatedRoute } from '@angular/router';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup } from '@angular/forms';
import { Subscription } from 'rxjs';
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { RippleModule } from 'primeng/ripple';
import { RatingModule } from 'primeng/rating';
import { InputNumberModule } from 'primeng/inputnumber';
import { PaginatorModule } from 'primeng/paginator';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { TooltipModule } from 'primeng/tooltip';
import { MessageModule } from 'primeng/message';
import { MessageService } from 'primeng/api';
import { Select } from 'primeng/select';
import { CheckboxModule } from 'primeng/checkbox';
import { RadioButtonModule } from 'primeng/radiobutton';
import { ProductService } from '../services/product.service';
import { CategoryService } from '../services/category.service';
import { BrandService } from '../services/brand.service';
import { BaseResponse, pagination } from '../../../core/models/baseResponse';
import { IBrand } from '../models/brand.interface';
import { DividerModule } from "primeng/divider";
import { ChipModule } from "primeng/chip";
import { MessagesModule } from 'primeng/messages';
import { InputTextModule } from 'primeng/inputtext';
import { ProductCardComponent } from "../../../shared/components/product-card/product-card.component";
import { DrawerModule } from 'primeng/drawer';
import { IProductQueryParams } from '../models/product.interface';
import { ICategory } from '../../../interfaces/category.interface';
import { IProduct } from '../models/product.interface';
import AOS from 'aos';
import { TranslateModule } from '@ngx-translate/core';
import { TranslationService } from '../../../core/services/translate.service';
import { MultilingualText } from '../../../core/models/multi-language';
import { MultiLanguagePipe } from '../../../core/pipes/multi-language.pipe';
import { CurrencyPipe } from '../../../core/pipes/currency.pipe';

@Component({
  selector: 'app-product-list',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    FormsModule,
    ReactiveFormsModule,
    CardModule,
    ButtonModule,
    RippleModule,
    RatingModule,
    InputNumberModule,
    InputTextModule,
    PaginatorModule,
    ProgressSpinnerModule,
    TooltipModule,
    MessageModule,
    Select,
    CheckboxModule,
    RadioButtonModule,
    ChipModule,
    DividerModule,
    MessagesModule,
    ProductCardComponent,
    DrawerModule,
    TranslateModule,
    MultiLanguagePipe,
    CurrencyPipe
],
  providers: [MessageService, ProductService, CategoryService, BrandService, FormBuilder, TranslateModule],
  templateUrl: './product-list.component.html',
  styleUrls: ['./product-list.component.scss'],
})
export class ProductListComponent implements OnInit, OnDestroy, AfterViewInit, AfterViewChecked {
  products: IProduct[] = [];
  loading = true;
  error: string | null = null;
  aosInitialized = false;
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
  sortOptions: { label: string; value: string }[] = [
    { label: 'Featured', value: 'featured' },
    { label: 'Newest First', value: 'createdAt,desc' },
    { label: 'Price: Low to High', value: 'price,asc' },
    { label: 'Price: High to Low', value: 'price,desc' },
    { label: 'Highest Rated', value: 'averageRating,desc' },
    { label: 'Name: A to Z', value: 'name,asc' },
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
    private messageService: MessageService,
    @Inject(PLATFORM_ID) private platformId: Object,
    private translationService: TranslationService
  ) {
    this.filterForm = this.fb.group({
      searchQuery: [''],
      selectedCategories: [[]],
      selectedBrands: [[]],
      selectedSizes: [[]],
      selectedColors: [[]],
      minPrice: [0],
      maxPrice: [1000],
      minRating: [0],
      showOnSale: [false],
      sortBy: ['featured'],
    });
  }

  ngAfterViewInit(): void {
    AOS.init({
      duration: 1000,
      easing: 'ease-out-cubic',
      once: true,
      offset: 60,
      delay: 200,
    });
    this.aosInitialized = true;
  }

  ngAfterViewChecked(): void {
    if (this.aosInitialized) {
      AOS.refresh();
      AOS.refreshHard();
    }
  }

  ngOnInit(): void {
    this.loadCategories();
    this.loadBrands();
    this.loadSizesAndColors();
    // this.loadProducts();
    this.filterForm.valueChanges.subscribe(() => this.onFilterChange());
    
    // Subscribe to query parameter changes
    this.subscriptions.add(
      this.route.queryParams.subscribe(params => {
        this.updateFiltersFromQueryParams(params);
      })
    );
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
      limit: 10,
      category: selectedCategories,
      brand: selectedBrands,
      minPrice,
      // maxPrice,
      size: selectedSizes,
      color: selectedColors,
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
        },
        error: (err) => {
          this.error = 'Failed to load products. Please try again later.';
          this.messageService.add({ severity: 'error', summary: 'Error', detail: this.error });
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
          console.error('Error loading categories:', err);
          this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Failed to load categories.' });
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
          console.error('Error loading brands:', err);
          this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Failed to load brands.' });
        },
      })
    );
  }

  loadSizesAndColors(): void {
    this.subscriptions.add(
      this.productService.getProducts({ limit: 100 }).subscribe({
        next: (response: BaseResponse<{ products: IProduct[]; pagination: pagination }>) => {
          this.sizes = [...new Set(response.data.products.flatMap((p) => p.sizes?.map((s) => s.en) || []))];
          this.colors = [...new Set(response.data.products.flatMap((p) => p.colors?.map((c) => c.en) || []))];
        },
        error: (err) => {
          console.error('Error loading sizes and colors:', err);
        },
      })
    );
  }

  onPageChange(event: any): void {
    this.first = event.first;
    this.rows = event.rows;
    this.loadProducts();
    // scroll to top
    if (isPlatformBrowser(this.platformId)) {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }

  onSortChange(): void {
    this.first = 0;
    // this.loadProducts();
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
    if (selectedSizes.length > 0) queryParams.size = selectedSizes.join(',');
    if (selectedColors.length > 0) queryParams.color = selectedColors.join(',');
    if (minPrice > 0) queryParams.minPrice = minPrice;
    if (maxPrice < 1000) queryParams.maxPrice = maxPrice;
    if (minRating > 0) queryParams.minRating = minRating;
    if (showOnSale) queryParams.inStock = true;
    if (sortBy !== 'featured') queryParams.sortBy = sortBy;
    
    // Update URL without reloading the page
    // this.router.navigate([], {
    //   relativeTo: this.route,
    //   queryParams,
    //   queryParamsHandling: 'merge',
    //   replaceUrl: true
    // });
  }

  clearAllFilters(): void {
    this.filterForm.reset({
      searchQuery: '',
      selectedCategories: [],
      selectedBrands: [],
      selectedSizes: [],
      selectedColors: [],
      minPrice: 0,
      maxPrice: 1000,
      minRating: 0,
      showOnSale: false,
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
      selectedBrands.length +
      selectedSizes.length +
      selectedColors.length +
      (showOnSale ? 1 : 0) +
      (minRating > 0 ? 1 : 0) +
      (minPrice > 0 || maxPrice < 1000 ? 1 : 0)
    );
  }

  getDiscountPercentage(product: IProduct): number | null {
    if (product.discountPrice && product.price > product.discountPrice) {
      return Math.round(((product.price - product.discountPrice) / product.price) * 100);
    }
    return null;
  }

  getProductImage(product: IProduct): string {
    return `${product.images?.[0]?.filePath}` || 'assets/images/placeholder.png';
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
    this.messageService.add({ severity: 'info', summary: 'Added to Cart', detail: `${product.name} added to cart.` });
  }

  toggleWishlist(product: IProduct, event: Event): void {
    event.stopPropagation();
    this.wishlistLoading = !this.wishlistLoading;
    this.messageService.add({ severity: 'info', summary: 'Added to Wishlist', detail: `${product.name} added to wishlist.` });
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
    return brand?.name || 'Unknown Brand';
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
}