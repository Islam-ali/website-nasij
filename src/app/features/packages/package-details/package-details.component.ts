import { Component, OnInit, OnDestroy, signal, ViewChild, ElementRef, inject, Inject, PLATFORM_ID } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { takeUntil, switchMap } from 'rxjs/operators';

import { 
  UiToastService, 
  UiButtonComponent,
} from '../../../shared/ui';

import { IPackage } from '../../../interfaces/package.interface';
import { PackageService } from '../services/package.service';
import { PackageUrlService } from '../services/package-url.service';
import { CartService } from '../../cart/services/cart.service';
import { ComponentBase } from '../../../core/directives/component-base.directive';
import { BaseResponse } from '../../../core/models/baseResponse';
import { TranslateModule } from '@ngx-translate/core';
import { TranslationService } from '../../../core/services/translate.service';
import { MultilingualText } from '../../../core/models/multi-language';
import { MultiLanguagePipe } from '../../../core/pipes/multi-language.pipe';
import { FallbackImgDirective } from '../../../core/directives';
import { CurrencyPipe } from '../../../core/pipes';
import { environment } from '../../../../environments/environment';
import { SeoService } from '../../../core/services/seo.service';

interface PackageImage {
  itemImageSrc: string;
  thumbnailImageSrc: string;
  alt: string;
  title: string;
}

const FRONTEND_DOMAIN = 'https://www.pledgestores.com';

@Component({
  selector: 'app-package-details',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    FormsModule,
    UiButtonComponent,
    TranslateModule,
    MultiLanguagePipe,
    FallbackImgDirective,
    CurrencyPipe
  ],
  templateUrl: './package-details.component.html',
})
export class PackageDetailsComponent extends ComponentBase implements OnInit, OnDestroy {
  @ViewChild('galleryImage') galleryImage!: ElementRef;
  
  package = signal<IPackage>({} as IPackage);
  loading = signal(true);
  error = signal<string | null>(null);
  quantity = 1;
  domain = environment.domain;
  activeTabIndex: number = 0;
  selectedVariants: { [key: string]: { [key: string]: MultilingualText } } = {};
  selectedQuantities: { [key: string]: number } = {};
  selectedVariantsByQuantity: { [key: string]: { [quantity: number]: { [key: string]: MultilingualText } } } = {};
  selectedColorsByQuantity: { [key: string]: { [quantity: number]: MultilingualText } } = {};
  selectedSizesByQuantity: { [key: string]: { [quantity: number]: MultilingualText } } = {};
  
  // Image gallery  
  images: PackageImage[] = [];
  responsiveOptions: any[] = [
    {
      breakpoint: '1024px',
      numVisible: 5
    },
    {
      breakpoint: '768px',
      numVisible: 3
    },
    {
      breakpoint: '560px',
      numVisible: 1
    }
  ];

  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private packageService = inject(PackageService);
  private toastService = inject(UiToastService);
  private packageUrlService = inject(PackageUrlService);
  private cartService = inject(CartService);
  private translationService = inject(TranslationService);
  private seoService = inject(SeoService);
  constructor(
    @Inject(PLATFORM_ID) private platformId: Object
  ) {
    super();
  }

  // Helper methods for MultilingualText
  getMultilingualValue(value: any): string {
    if (typeof value === 'string') {
      return value;
    }
    if (value && typeof value === 'object' && (value.en || value.ar)) {
      return value[this.currentLanguage] || value.en;
    }
    return value?.toString() || '';
  }

  findMultilingualVariant(product: any, variantType: string, value: string): any {
    return product.variants?.find((variant: any) =>
      variant.attributes?.some((attr: any) =>
        attr.variant === variantType && this.getMultilingualValue(attr.value) === value
      )
    );
  }

  findMultilingualAttribute(product: any, variantType: string, value: string): any {
    for (const variant of product.variants || []) {
      if (variant.attributes) {
        for (const attr of variant.attributes) {
          if (attr.variant === variantType && this.getMultilingualValue(attr.value) === value) {
            return attr;
          }
        }
      }
    }
    return null;
  }

  ngOnInit(): void {
    this.loadPackage();
  }

  override ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadPackage(): void {
    this.loading.set(true);
    this.error.set(null);

    // Check for encoded package data in query parameters first
    this.route.queryParams.subscribe(queryParams => {
      const encodedPackageData = this.packageUrlService.getPackageFromUrl(queryParams);
      
      if (encodedPackageData && encodedPackageData.data) {
        // Use encoded package data
        this.handleEncodedPackageData(encodedPackageData.data);
        return;
      }
    });

    // Check if package was resolved by the resolver
    const resolvedPackage = this.route.snapshot.data['package'] as IPackage | null;
    
    if (resolvedPackage) {
      // Package was already loaded by the resolver
      this.package.set(resolvedPackage);
      this.initializeVariants();
      this.setupImages();
      this.updateSeo(resolvedPackage);
      this.loading.set(false);
    } else {
      // Fallback: load package manually if resolver didn't run
      this.route.params
        .pipe(
          takeUntil(this.destroy$),
          switchMap(params => {
            const packageId = params['id'];
            return this.packageService.getPackage(packageId);
          })
        )
        .subscribe({
          next: (response: BaseResponse<IPackage>) => {
            this.package.set(response.data);
            this.initializeVariants();
            this.setupImages();
            this.updateSeo(response.data);
            this.loading.set(false);
          },
          error: (err) => {
            this.error.set('Failed to load package details. Please try again later.');
            this.loading.set(false);
            this.toastService.error('Failed to load package details', 'Error');
          }
        });
    }
  }

  private handleEncodedPackageData(encodedData: any): void {
    try {
      // If the encoded data contains package information, use it
      if (encodedData.packageId) {
        // Load the actual package from the service
        this.packageService.getPackage(encodedData.packageId).subscribe({
          next: (response: BaseResponse<IPackage>) => {
            this.package.set(response.data);
            this.initializeVariants();
            this.setupImages();
            this.updateSeo(response.data);
            this.loading.set(false);
            
            // Pre-fill form with encoded data if available
            if (encodedData.quantity) {
              this.quantity = encodedData.quantity;
            }
            
            if (encodedData.selectedVariants) {
              this.selectedVariantsByQuantity = encodedData.selectedVariants;
            }
          },
          error: (err) => {
            this.error.set('Failed to load package details from encoded data.');
            this.loading.set(false);
          }
        });
      } else {
        // If no packageId, show error
        this.error.set('Invalid package data in URL.');
        this.loading.set(false);
      }
    } catch (error) {
      console.error('Error handling encoded package data:', error);
      this.error.set('Failed to process package data from URL.');
      this.loading.set(false);
    }
  }

  initializeVariants(): void {
    const packageData = this.package();
    if (!packageData) return;
    
    packageData.items.forEach(item => {
      const productId = item.productId._id;
      
      // Initialize quantities
      this.selectedQuantities[productId] = item.quantity;
      
      // Initialize variants
      this.selectedVariants[productId] = {};
      
      // Store full attribute objects for comparison with template
      const firstAttributesMap: Record<string, any> = {};
      
      if (item.requiredVariantAttributes && item.requiredVariantAttributes.length > 0) {
        // Use required variant attributes if available
        item.requiredVariantAttributes.forEach(attr => {
          this.selectedVariants[productId][attr.variant] = attr.value;
          firstAttributesMap[attr.variant] = attr;
        });
      } else if (item.productId.variants && item.productId.variants.length > 0) {
        // Fallback: Select first available variant of each type by default
        const firstVariantsMap: Record<string, any> = {};
        
        // Iterate through all variants to find the first occurrence of each variant type
        item.productId.variants.forEach(variant => {
          if (variant.attributes && variant.attributes.length > 0) {
            variant.attributes.forEach(attr => {
              // Only set if we haven't seen this variant type before
              if (!firstVariantsMap[attr.variant]) {
                firstVariantsMap[attr.variant] = attr.value;
                firstAttributesMap[attr.variant] = attr; // Store full attribute object
              }
            });
          }
        });
        
        // Apply the first variants to selectedVariants
        this.selectedVariants[productId] = firstVariantsMap;
      }
      
      // Initialize variants by quantity
      this.selectedVariantsByQuantity[productId] = {};
      this.selectedColorsByQuantity[productId] = {};
      this.selectedSizesByQuantity[productId] = {};
      
      for (let i = 1; i <= item.quantity; i++) {
        this.selectedVariantsByQuantity[productId][i] = {};
        this.selectedColorsByQuantity[productId][i] = {} as MultilingualText;
        this.selectedSizesByQuantity[productId][i] = {} as MultilingualText;
        
        // Use full attribute objects for selectedVariantsByQuantity (for template comparison)
        if (Object.keys(firstAttributesMap).length > 0) {
          Object.entries(firstAttributesMap).forEach(([variantType, attribute]) => {
            // Store the full attribute object for proper comparison
            this.selectedVariantsByQuantity[productId][i][variantType] = attribute;
            
            // Set default color and size if available
            if (variantType === 'color') {
              this.selectedColorsByQuantity[productId][i] = attribute.value;
            } else if (variantType === 'size') {
              this.selectedSizesByQuantity[productId][i] = attribute.value;
            }
          });
        } else if (this.selectedVariants[productId] && Object.keys(this.selectedVariants[productId]).length > 0) {
          // Fallback for when we only have values
          Object.entries(this.selectedVariants[productId]).forEach(([variant, value]) => {
            this.selectedVariantsByQuantity[productId][i][variant] = value;
            
            if (variant === 'color') {
              this.selectedColorsByQuantity[productId][i] = value;
            } else if (variant === 'size') {
              this.selectedSizesByQuantity[productId][i] = value;
            }
          });
        }
      }
    });
  }

  setupImages(): void {
    const packageData = this.package();
    if (!packageData || !packageData.images) return;

    this.images = packageData.images.map((image, index) => ({
      itemImageSrc: this.getImageUrl(image.filePath),
      thumbnailImageSrc: this.getImageUrl(image.filePath),
      alt: `${packageData.name} - Image ${index + 1}`,
      title: `${packageData.name} - Image ${index + 1}`
    }));
  }

  getMainImage(): string {
    const packageData = this.package();
    if (!packageData || !packageData.images || packageData.images.length === 0) {
      return '/assets/images/photo.png';
    }
    const imagePath = packageData.images[0]?.filePath;
    if (!imagePath) return '/assets/images/photo.png';
    // If path starts with 'assets/', return as absolute path from root
    if (imagePath.startsWith('assets/') || imagePath.startsWith('/assets/') || imagePath.startsWith('./assets/')) {
      return imagePath.startsWith('/') ? imagePath : `/${imagePath}`;
    }
    return `${this.domain}/${imagePath}`;
  }

  // Helper method to add domain prefix to file paths
  getImageUrl(imagePath: string): string {
    if (!imagePath) return '/assets/images/photo.png';
    if (imagePath.startsWith('http')) return imagePath;
    // If path starts with 'assets/', return as absolute path from root (no domain)
    if (imagePath.startsWith('assets/') || imagePath.startsWith('/assets/') || imagePath.startsWith('./assets/')) {
      // Ensure it starts with / for absolute path from root
      return imagePath.startsWith('/') ? imagePath : `/${imagePath}`;
    }
    // For other paths, add domain
    return `${this.domain}/${imagePath}`;
  }

  getItemsCount(): number {
    const packageData = this.package();
    if (!packageData || !packageData.items) return 0;
    return packageData.items.reduce((total, item) => total + item.quantity, 0);
  }

  getTotalValue(): number {
    const packageData = this.package();
    if (!packageData) return 0;
    
    // السعر الإجمالي = السعر الأصلي للحزمة × الكمية
    return packageData.price * this.quantity;
  }

  getSavings(): number {
    const packageData = this.package();
    if (!packageData) return 0;
    
    // التوفير = السعر الأصلي - السعر المخفض
    if (packageData.discountPrice) {
      return packageData.discountPrice * this.quantity;
    }
    return 0;
  }

  getSavingsPercentage(): number {
    const totalValue = this.getTotalValue();
    if (totalValue === 0) return 0;
    return Math.round((this.getSavings() / totalValue) * 100);
  }

  onVariantChange(productId: string, variant: string, value: MultilingualText): void {
    if (!this.selectedVariants[productId]) {
      this.selectedVariants[productId] = {};
    }
    this.selectedVariants[productId][variant] = value;
  }

  onVariantChangeByQuantity(productId: string, quantity: number, variant: string, value: MultilingualText, event?: any): void {
    if (!this.selectedVariantsByQuantity[productId]) {
      this.selectedVariantsByQuantity[productId] = {};
    }
    if (!this.selectedVariantsByQuantity[productId][quantity]) {
      this.selectedVariantsByQuantity[productId][quantity] = {};
    }
    this.selectedVariantsByQuantity[productId][quantity][variant] = value;
    
    // Add ripple effect
    if (event) {
      this.createRippleEffect(event);
    }
  }

  createRippleEffect(event: any): void {
    if (!isPlatformBrowser(this.platformId)) return;
    const button = event.target.closest('.color-swatch');
    if (!button) return;

    const ripple = document.createElement('div');
    const rect = button.getBoundingClientRect();
    const size = Math.max(rect.width, rect.height);
    const x = event.clientX - rect.left - size / 2;
    const y = event.clientY - rect.top - size / 2;

    ripple.style.width = ripple.style.height = size + 'px';
    ripple.style.left = x + 'px';
    ripple.style.top = y + 'px';
    ripple.classList.add('color-swatch-ripple');

    button.appendChild(ripple);

    setTimeout(() => {
      ripple.remove();
    }, 600);
  }

  isVariantSelectedByQuantity(productId: string, quantity: number, variant: string, value: MultilingualText): boolean {
    const selectedValue = this.selectedVariantsByQuantity[productId]?.[quantity]?.[variant];
    if (!selectedValue || !value) return false;
    
    // Compare multilingual values
    return this.getMultilingualValue(selectedValue) === this.getMultilingualValue(value);
  }

  onQuantityChange(productId: string, quantity: number): void {
    this.selectedQuantities[productId] = quantity;
    
    // Update variants by quantity when quantity changes
    if (!this.selectedVariantsByQuantity[productId]) {
      this.selectedVariantsByQuantity[productId] = {};
    }
    if (!this.selectedColorsByQuantity[productId]) {
      this.selectedColorsByQuantity[productId] = {};
    }
    if (!this.selectedSizesByQuantity[productId]) {
      this.selectedSizesByQuantity[productId] = {};
    }
    
    // Add new quantity slots if quantity increased
    for (let i = 1; i <= quantity; i++) {
      if (!this.selectedVariantsByQuantity[productId][i]) {
        this.selectedVariantsByQuantity[productId][i] = {};
        // Copy from first variant if available
        if (this.selectedVariantsByQuantity[productId][1]) {
          // Deep copy to preserve MultilingualText objects
          Object.keys(this.selectedVariantsByQuantity[productId][1]).forEach(key => {
            this.selectedVariantsByQuantity[productId][i][key] = this.selectedVariantsByQuantity[productId][1][key];
          });
        }
      }
      if (!this.selectedColorsByQuantity[productId][i]) {
        this.selectedColorsByQuantity[productId][i] = this.selectedColorsByQuantity[productId][1] || '';
      }
      if (!this.selectedSizesByQuantity[productId][i]) {
        this.selectedSizesByQuantity[productId][i] = this.selectedSizesByQuantity[productId][1] || '';
      }
    }
    
    // Remove excess quantity slots if quantity decreased
    Object.keys(this.selectedVariantsByQuantity[productId]).forEach(key => {
      const qty = parseInt(key);
      if (qty > quantity) {
        delete this.selectedVariantsByQuantity[productId][qty];
        delete this.selectedColorsByQuantity[productId][qty];
        delete this.selectedSizesByQuantity[productId][qty];
      }
    });
  }

  getSelectedQuantity(productId: string): number {
    return this.selectedQuantities[productId] || 1;
  }

  getQuantityArray(quantity: number): number[] {
    return Array.from({ length: quantity }, (_, i) => i + 1);
  }

  // Dynamic variant methods
  getAvailableVariants(productId: string, variantType: string): MultilingualText[] {
    const packageData = this.package();
    if (!packageData) return [];
    
    const item = packageData.items.find(i => i.productId._id === productId);
    if (!item?.productId?.variants) return [];
    
    const variants = new Set<MultilingualText>();
    item.productId.variants.forEach(variant => {
      if (variant.attributes) {
        variant.attributes.forEach(attr => {
          if (attr.variant === variantType) {
            variants.add(attr.value);
          }
        });
      }
    });
    
    return Array.from(variants);
  }

  // Get all variant types for a product
  getAvailableVariantTypes(productId: string): string[] {
    const packageData = this.package();
    if (!packageData) return [];
    
    const item = packageData.items.find(i => i.productId._id === productId);
    if (!item?.productId?.variants) return [];
    
    const variantTypes = new Set<string>();
    item.productId.variants.forEach(variant => {
      if (variant.attributes) {
        variant.attributes.forEach(attr => {
          variantTypes.add(attr.variant);
        });
      }
    });
    
    return Array.from(variantTypes);
  }

  // Map variants for a specific product (similar to product-details component)
  getMappedVariantsForProduct(productId: string): {variant: string, attributes: any[]}[] {
    const packageData = this.package();
    if (!packageData) return [];
    
    const item = packageData.items.find(i => i.productId._id === productId);
    if (!item?.productId?.variants) return [];
    
    const variantMap: Record<string, any[]> = {};
    
    item.productId.variants.forEach(variant => {
      if (variant.attributes) {
        variant.attributes.forEach(attr => {
          if (!variantMap[attr.variant]) {
            variantMap[attr.variant] = [];
          }
          
          const exists = variantMap[attr.variant].some(
            a => a._id === attr._id
          );
          if (!exists) {
            variantMap[attr.variant].push(attr);
          }
        });
      }
    });
    
    return Object.entries(variantMap).map(([variant, attributes]) => ({
      variant,
      attributes
    }));
  }

  // Dynamic variant selection methods
  onVariantSelectForQuantity(productId: string, quantity: number, variantType: string, attribute: any, event?: any): void {
    if (!this.selectedVariantsByQuantity[productId]) {
      this.selectedVariantsByQuantity[productId] = {};
    }
    if (!this.selectedVariantsByQuantity[productId][quantity]) {
      this.selectedVariantsByQuantity[productId][quantity] = {};
    }
    this.selectedVariantsByQuantity[productId][quantity][variantType] = attribute;
    
    // Add ripple effect
    if (event) {
      this.createRippleEffect(event);
    }
  }

  isVariantSelectedForQuantity(productId: string, quantity: number, variantType: string, attribute: any): boolean {
    const selectedAttribute = this.selectedVariantsByQuantity[productId]?.[quantity]?.[variantType];
    if (!selectedAttribute || !attribute) return false;
    
    return (selectedAttribute as any)._id === attribute._id;
  }

  getVariantIcon(variantType: string): string {
    switch (variantType) {
      case 'size':
        return 'pi-arrows-alt';
      case 'color':
        return 'pi-palette';
      case 'material':
        return 'pi-box';
      case 'style':
        return 'pi-star';
      case 'pattern':
        return 'pi-th-large';
      case 'finish':
        return 'pi-sun';
      case 'weight':
        return 'pi-weight-hanging';
      case 'length':
        return 'pi-arrows-h';
      case 'width':
        return 'pi-arrows-h';
      case 'height':
        return 'pi-arrows-v';
      default:
        return 'pi-tag';
    }
  }

  // Backward compatibility - keep existing methods for now
  getAvailableColors(productId: string): MultilingualText[] {
    return this.getAvailableVariants(productId, 'color');
  }

  getAvailableSizes(productId: string): MultilingualText[] {
    return this.getAvailableVariants(productId, 'size');
  }

  getVariantKeysLength(variants: any): number {
    return variants ? Object.keys(variants).length : 0;
  }


  onColorSelectForQuantity(productId: string, quantity: number, color: MultilingualText, event?: any): void {
    if (!this.selectedColorsByQuantity[productId]) {
      this.selectedColorsByQuantity[productId] = {};
    }
    this.selectedColorsByQuantity[productId][quantity] = color;
    
    // Update the variant selection
    if (!this.selectedVariantsByQuantity[productId]) {
      this.selectedVariantsByQuantity[productId] = {};
    }
    if (!this.selectedVariantsByQuantity[productId][quantity]) {
      this.selectedVariantsByQuantity[productId][quantity] = {};
    }
    this.selectedVariantsByQuantity[productId][quantity]['color'] = color; // Store as MultilingualText
    
    // Add ripple effect
    if (event) {
      this.createRippleEffect(event);
    }
  }

  onSizeSelectForQuantity(productId: string, quantity: number, size: MultilingualText, event?: any): void {
    if (!this.selectedSizesByQuantity[productId]) {
      this.selectedSizesByQuantity[productId] = {};
    }
    this.selectedSizesByQuantity[productId][quantity] = size;
    
    // Update the variant selection
    if (!this.selectedVariantsByQuantity[productId]) {
      this.selectedVariantsByQuantity[productId] = {};
    }
    if (!this.selectedVariantsByQuantity[productId][quantity]) {
      this.selectedVariantsByQuantity[productId][quantity] = {};
    }
    this.selectedVariantsByQuantity[productId][quantity]['size'] = size; // Store as MultilingualText
    
    // Add ripple effect
    if (event) {
      this.createRippleEffect(event);
    }
  }

  getVariantImageForQuantity(productId: string, quantity: number): string {
    const packageData = this.package();
    if (!packageData) return '/assets/images/photo.png';
    
    const item = packageData.items.find(i => i.productId._id === productId);
    if (!item) return '/assets/images/photo.png';
    
    // Try to find image based on selected variants
    const selectedVariants = this.selectedVariantsByQuantity[productId]?.[quantity];
    if (selectedVariants) {
      // Try to find image based on any variant with image
      for (const [variantType, attribute] of Object.entries(selectedVariants)) {
        if (attribute && (attribute as any).image?.filePath) {
          return this.getImageUrl((attribute as any).image.filePath);
        }
      }
    }
    // Fallback to product main image
    const productImage = item.productId.images?.[0]?.filePath;
    return productImage ? this.getImageUrl(productImage) : '/assets/images/photo.png';
  }

  getVariantImage(productId: string, variantType: string, value: MultilingualText): string | null {
    const packageData = this.package();
    if (!packageData) return null;
    
    const item = packageData.items.find(i => i.productId._id === productId);
    if (!item?.productId?.variants) return null;
    
    // Find the variant that has this value
    for (const variant of item.productId.variants) {
      if (variant.attributes) {
        for (const attr of variant.attributes) {
          if (attr.variant === variantType && 
              this.getMultilingualValue(attr.value) === this.getMultilingualValue(value) && 
              attr.image?.filePath) {
            return attr.image.filePath;
          }
        }
      }
    }
    
    return null;
  }

  increaseQuantity(): void {
    if (this.quantity < (this.package().stock || 1)) {
      this.quantity++;
    }
  }

  decreaseQuantity(): void {
    if (this.quantity > 1) {
      this.quantity--;
    }
  }

  getColorValue(colorName: any): string {
    const colorMap: { [key: string]: string } = {
      'white': '#ffffff',
      'black': '#000000',
      'gray': '#6b7280',
      'red': '#ef4444',
      'blue': '#3b82f6',
      'green': '#10b981',
      'yellow': '#f59e0b',
      'purple': '#8b5cf6',
      'pink': '#ec4899',
      'orange': '#f97316',
      'indigo': '#6366f1',
      'cyan': '#06b6d4',
      'lime': '#84cc16',
      'emerald': '#10b981',
      'teal': '#14b8a6',
      'sky': '#0ea5e9',
      'violet': '#8b5cf6',
      'fuchsia': '#d946ef',
      'rose': '#f43f5e',
      'amber': '#f59e0b',
      'slate': '#64748b',
      'zinc': '#71717a',
      'neutral': '#737373',
      'stone': '#78716c',
      'khaki': '#d2b48c',
      'navy': '#000080',
      'olive': '#556b2f',
      'tan': '#d2b48c'
    };
    
    const colorText = this.getDisplayText(colorName);
    return colorMap[colorText.toLowerCase()] || colorText;
  }

  openImageModal(imageSrc: string): void {
    // يمكن إضافة modal للصور هنا لاحقاً
  }

  onColorHover(colorName: any): void {
    // يمكن إضافة تأثيرات إضافية عند hover
  }

  onColorLeave(): void {
    // يمكن إضافة تأثيرات إضافية عند leave    
  }



  getSelectedVariantForQuantity(productId: string, quantity: number): any {
    // البحث عن الـ variant المحدد للكمية المحددة
    const packageItem = this.package()?.items?.find(item => item.productId._id === productId);
    if (!packageItem?.productId?.variants) return null;

    // البحث عن الـ variant الذي يحتوي على الـ attributes المحددة
    for (let variant of packageItem.productId.variants) {
      if (variant.attributes && variant.attributes.length > 0) {
        const hasSelectedAttributes = variant.attributes.some(attr => {
          const selectedValue = this.selectedVariantsByQuantity[productId]?.[quantity]?.[attr.variant];
          return selectedValue && this.getMultilingualValue(selectedValue) === this.getMultilingualValue(attr.value);
        });
        if (hasSelectedAttributes) {
          return variant;
        }
      }
    }

    return null;
  }

  getSelectedAttributeForQuantity(productId: string, quantity: number): any {
    // البحث عن الـ attribute المحدد للكمية المحددة
    const packageItem = this.package()?.items?.find(item => item.productId._id === productId);
    if (!packageItem?.productId?.variants) return null;

    const selectedVariants = this.selectedVariantsByQuantity[productId]?.[quantity];
    if (!selectedVariants) return null;

    // البحث عن الـ attribute المحدد
    for (let variant of packageItem.productId.variants) {
      if (variant.attributes && variant.attributes.length > 0) {
        for (let attr of variant.attributes) {
          const selectedValue = selectedVariants[attr.variant];
          if (selectedValue && this.getMultilingualValue(selectedValue) === this.getMultilingualValue(attr.value)) {
            return attr;
          }
        }
      }
    }

    return null;
  }

  getAttributeImage(attr: any, variant: any, product: any): string {
    // أولاً: تحقق من وجود صورة في الـ attribute نفسه
    if (attr.image?.filePath) {
      return attr.image.filePath;
    }

    // ثانياً: تحقق من وجود صورة في الـ variant
    if (variant.image?.filePath) {
      return variant.image.filePath;
    }

    // ثالثاً: استخدم صورة المنتج الافتراضية
    return product.images?.[0]?.filePath || '/assets/images/photo.png';
  }

  getItemTotalPrice(item: any): number {
    // لا نحسب سعر المنتج الفردي - السعر الوحيد هو سعر الحزمة
    return 0;
  }

  getPackageTotalPrice(): number {
    const packageData = this.package();
    if (!packageData) return 0;
    
    // السعر الوحيد هو سعر الحزمة × الكمية
    const packagePrice = packageData.price - (packageData.discountPrice || 0);
    return packagePrice * this.quantity;
  }

  isVariantSelected(productId: string, variant: string, value: MultilingualText): boolean {
    const selectedValue = this.selectedVariants[productId]?.[variant];
    if (!selectedValue || !value) return false;
    
    // Compare multilingual values
    return this.getMultilingualValue(selectedValue) === this.getMultilingualValue(value);
  }

  validateVariants(): boolean {
    const packageData = this.package();
    if (!packageData) return false;

    for (const item of packageData.items) {
      if (item.requiredVariantAttributes && item.requiredVariantAttributes.length > 0) {
        for (const attr of item.requiredVariantAttributes) {
          const selectedValue = this.selectedVariants[item.productId._id]?.[attr.variant];
          if (!selectedValue || !this.getMultilingualValue(selectedValue)) {
            return false;
          }
        }
      }
    }
    return true;
  }

  addToCart(): void {
    const packageData = this.package();
    if (!packageData) return;

    // Validate all items have required variants selected
    if (!this.validateVariants()) {
      this.toastService.warn('Please select all required variants for all products before adding to cart', 'Warning');
      return;
    }

    // Validate quantities
    for (const item of packageData.items) {
      const quantity = this.getSelectedQuantity(item.productId._id);
      if (quantity <= 0) {
        this.toastService.warn(`Please select a valid quantity for ${item.productId.name}`, 'Warning');
        return;
      }
    }

    // Prepare package data for cart
    const packageDataForCart = {
      packageId: packageData._id!,
      quantity: this.quantity,
      price: packageData.price,
      discount: packageData.discountPrice ,
      productName: packageData.name,
      image: this.getImageUrl(packageData.images?.[0]?.filePath || ''),
      packageItems: packageData.items.map(item => ({
        productId: item.productId._id,
        productName: item.productId.name,
        quantity: this.getSelectedQuantity(item.productId._id),
        price: item.productId.price,
        image: this.getImageUrl(item.productId.images?.[0]?.filePath || ''),
        selectedVariants: this.buildSelectedVariantsForItem(item.productId._id)
      })),
      selectedVariants: this.selectedVariantsByQuantity
    };

    // Add package to cart using cart service
    this.cartService.addPackageToCart(packageDataForCart as any).subscribe({
      next: (cartState) => {
        this.toastService.success('Package added to cart successfully!', 'Success');
      },
      error: (error) => {
        this.toastService.error('Failed to add package to cart. Please try again.', 'Error');
      }
    });
  }

  buyNow(): void {
    const packageData = this.package();
    if (!packageData) return;

    // Validate all items have required variants selected
    if (!this.validateVariants()) {
      this.toastService.warn('Please select all required variants for all products before proceeding', 'Warning');
      return;
    }

    // Validate quantities
    for (const item of packageData.items) {
      const quantity = this.getSelectedQuantity(item.productId._id);
      if (quantity <= 0) {
        this.toastService.warn(`Please select a valid quantity for ${item.productId.name}`, 'Warning');
        return;
      }
    }

    // Create package data for URL encoding
    const packageDataForUrl = {
      packageId: packageData._id,
      quantity: this.quantity,
      price: packageData.price,
      productName: packageData.name,
      image: this.getImageUrl(packageData.images?.[0]?.filePath || ''),
      type: 'Package',
      packageItems: packageData.items.map(item => ({
        productId: item.productId._id,
        productName: item.productId.name,
        quantity: this.getSelectedQuantity(item.productId._id),
        price: item.productId.price,
        image: this.getImageUrl(item.productId.images?.[0]?.filePath || ''),
        selectedVariants: this.buildSelectedVariantsForItem(item.productId._id)
      })),
      discount: packageData.discountPrice,
      selectedVariants: this.selectedVariantsByQuantity
    };
    // Navigate to checkout with encoded package data
    this.packageUrlService.navigateToCheckoutWithPackage(packageDataForUrl as any);
  }

  buildSelectedVariantsForItem(productId: string): any[] {
    const variants: any[] = [];
    const productVariants = this.selectedVariantsByQuantity[productId];
    
    if (productVariants) {
      // Get all unique variants from all quantities
      const allVariants = new Map<string, any>();
      
      Object.values(productVariants).forEach((quantityVariants: any) => {
        Object.entries(quantityVariants).forEach(([variant, value]: [string, any]) => {
          const valueString = this.getMultilingualValue(value);
          const variantKey = `${variant}_${valueString}`;
          if (!allVariants.has(variantKey)) {
            const variantImage = this.getVariantImageForItem(productId, variant, valueString);
            const fallbackImage = this.getFallbackVariantImage(productId, variant, valueString);
            
            allVariants.set(variantKey, {
              variant: variant,
              value: value.value, // Keep as MultilingualText
              image: value.image
            });
          }
        });
      });
      variants.push(...Array.from(allVariants.values()));
    }
    
    // If no variants found, try to get from the old selectedVariants structure
    if (variants.length === 0 && this.selectedVariants[productId]) {
      Object.entries(this.selectedVariants[productId]).forEach(([variant, value]) => {
        const valueString = this.getMultilingualValue(value);
        const variantImage = this.getVariantImageForItem(productId, variant, valueString);
        const fallbackImage = this.getFallbackVariantImage(productId, variant, valueString);
        
        variants.push({
          variant: variant,
          value: value, // Keep as MultilingualText
          image: variantImage || fallbackImage || this.getProductMainImage(productId)
        });
      });
    }
    
    // If still no variants found, try to get from product's required variant attributes
    if (variants.length === 0) {
      const packageData = this.package();
      if (packageData) {
        const item = packageData.items.find(i => i.productId._id === productId);
        if (item && item.requiredVariantAttributes) {
          item.requiredVariantAttributes.forEach(attr => {
            const variantValue = this.getMultilingualValue(attr.value);
            const variantImage = this.getVariantImageForItem(productId, attr.variant, variantValue);
            const fallbackImage = this.getFallbackVariantImage(productId, attr.variant, variantValue);
            
            variants.push({
              variant: attr.variant,
              value: attr.value,
              image: variantImage || fallbackImage || this.getProductMainImage(productId)
            });
          });
        }
      }
    }
    
    return variants;
  }

  get currentLanguage(): 'en' | 'ar' {
    return this.translationService.getCurrentLanguage() as 'en' | 'ar';
  }

  // Method to get display text for color/size from MultilingualText
  getDisplayText(value: any): string {
    if (typeof value === 'string') {
      return value;
    }
    if (value && typeof value === 'object' && (value.en || value.ar)) {
      return this.getMultilingualValue(value);
    }
    return value?.toString() || '';
  }

  getProductMainImage(productId: string): string | undefined {
    const packageData = this.package();
    if (!packageData) return undefined;
    
    const item = packageData.items.find(i => i.productId._id === productId);
    const imagePath = item?.productId?.images?.[0]?.filePath;
    return imagePath ? this.getImageUrl(imagePath) : undefined;
  }

  getProductImagePath(item: any): string {
    if (!item || !item.productId || !item.productId.images || item.productId.images.length === 0) {
      return '/assets/images/photo.png';
    }
    return item.productId.images[0].filePath || '/assets/images/photo.png';
  }

  getVariantImageForItem(productId: string, variant: string, value: string | MultilingualText): string | undefined {
    const packageData = this.package();
    if (!packageData) return undefined;
    
    const item = packageData.items.find(i => i.productId._id === productId);
    if (!item) return undefined;
    
    const valueString = typeof value === 'string' ? value : this.getMultilingualValue(value);
    
    // 1. Find variant image from product variants
    if (item.productId.variants) {
      for (const variantObj of (item.productId.variants as any[])) {
        // Check if this variant object matches our variant and value
        if (variantObj.variant === variant && variantObj.value === value) {
          if (variantObj.image?.filePath) {
            return this.getImageUrl(variantObj.image.filePath);
          }
        }
        
        // Check attributes within variant object
        if (variantObj.attributes && variantObj.attributes.length > 0) {
          const matchingAttr = variantObj.attributes.find((attr: any) => 
            attr.variant === variant && this.getMultilingualValue(attr.value) === value
          );
          if (matchingAttr?.image?.filePath) {
            return this.getImageUrl(matchingAttr.image.filePath);
          }
        }
      }
    }
    
    // 2. Find variant image from product attributes
    const attribute = (item.productId as any).attributes?.find((attr: any) => 
      attr.variant === variant && this.getMultilingualValue(attr.value) === value
    );
    
    if (attribute?.image?.filePath) {
      return this.getImageUrl(attribute.image.filePath);
    }
    
    // 3. Fallback to variant image
    const variantImage = (item.productId as any).variantImages?.find((vi: any) => 
      vi.variant === variant && vi.value === value
    );
    
    if (variantImage?.image?.filePath) {
        return this.getImageUrl(variantImage.image.filePath);
    }
    
    return undefined;
  }

  getFallbackVariantImage(productId: string, variant: string, value: string): string | undefined {
    const packageData = this.package();
    if (!packageData) return undefined;
    
    const item = packageData.items.find(i => i.productId._id === productId);
    if (!item) return undefined;
    
    // Try to find any image for this variant value from any source
    if (item.productId.variants) {
      for (const variantObj of (item.productId.variants as any[])) {
        // Check if this variant object matches our variant and value
        if (variantObj.variant === variant && variantObj.value === value) {
          if (variantObj.image?.filePath) {
            return this.getImageUrl(variantObj.image.filePath);
          }
        }
        
        // Check attributes within variant object
        if (variantObj.attributes && variantObj.attributes.length > 0) {
          const matchingAttr = variantObj.attributes.find((attr: any) => 
            attr.variant === variant && this.getMultilingualValue(attr.value) === value
          );
          if (matchingAttr?.image?.filePath) {
            return this.getImageUrl(matchingAttr.image.filePath);
          }
        }
        
        // If variant object has image and matches the value
        if (variantObj.image?.filePath && variantObj.value === value) {
          return this.getImageUrl(variantObj.image.filePath);
        }
      }
    }
    
    // Try to find any image for this variant type (color, size, etc.)
    if (item.productId.variants) {
      for (const variantObj of (item.productId.variants as any[])) {
        if (variantObj.variant === variant && variantObj.image?.filePath) {
          return this.getImageUrl(variantObj.image.filePath);
        }
      }
    }
    
    // Fallback to product main image
    const mainImage = item.productId.images?.[0]?.filePath;
    return mainImage ? this.getImageUrl(mainImage) : undefined;
  }

  addToWishlist(): void {
    // This will be implemented when we integrate with wishlist service
    this.toastService.success('Package added to wishlist', 'Success');
  }

  onImageError(event: Event): void {
    const target = event.target as HTMLImageElement;
    if (target) {
      // Prevent infinite loop if fallback also fails
      const currentSrc = target.src || target.getAttribute('src') || '';
      if (!currentSrc.includes('/assets/images/photo.png') && !currentSrc.includes('assets/images/photo.png')) {
        try {
          target.src = '/assets/images/photo.png';
        } catch (error) {
          // Silently fail to prevent console errors
          console.warn('Failed to set fallback image:', error);
        }
      }
    }
  }

  onTabChange(event: any): void {
    this.activeTabIndex = event;
  }

  getRatingStars(rating: number): number[] {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;

    for (let i = 0; i < fullStars; i++) {
      stars.push(1);
    }
    if (hasHalfStar) {
      stars.push(0.5);
    }
    const remainingStars = 5 - stars.length;
    for (let i = 0; i < remainingStars; i++) {
      stars.push(0);
    }
    return stars;
  }

  getStockStatus(stock: number): { text: string; severity: string } {
    if (stock === 0) {
      return { text: 'Out of Stock', severity: 'danger' };
    } else if (stock <= 5) {
      return { text: 'Low Stock', severity: 'warning' };
    } else {
      return { text: 'In Stock', severity: 'success' };
    }
  }


  share(): void {
    if (!this.package()) return;
    if (!isPlatformBrowser(this.platformId)) return;
    const url = window.location.href;
    navigator.share({
      url: url
    });
  }

  private updateSeo(packageData: IPackage): void {
    const localizedName = packageData.name?.[this.currentLanguage] || packageData.name?.en || '';
    const localizedSummary = packageData.description?.[this.currentLanguage] || packageData.description?.en || '';
    const description = localizedSummary
      ? localizedSummary.replace(/<[^>]+>/g, '').substring(0, 160)
      : `Discover ${localizedName} package with premium quality products on pledgestores.com.`;
    const canonicalUrl = `${FRONTEND_DOMAIN}/packages/${packageData._id}`;
    const ogImage = packageData.images?.length
      ? `${this.domain}/${packageData.images[0].filePath}`
      : `${this.domain}/assets/images/logo.png`;

    // Build comprehensive keywords including package name, tags, and general keywords
    const baseKeywords = this.currentLanguage === 'ar'
      ? 'حزم منتجات, بوكسات, منتجات طلابية, استيكرز, براويز, طلاب الأزهر, طلاب الجامعات, منتجات ملهمة, هدايا طلابية'
      : 'product packages, boxes, student products, stickers, frames, Al-Azhar students, university students, inspirational products, student gifts';
    
    const packageKeywords = [
      localizedName,
      ...(packageData.tags || []),
      baseKeywords
    ].filter(k => k && k.trim()).join(', ');

    this.seoService.updateSeo({
      title: `${localizedName} | ${this.currentLanguage === 'ar' ? 'حزم منتجات' : 'Product Packages'}`,
      description,
      keywords: packageKeywords,
      canonicalUrl,
      ogImage,
      ogType: 'product',
      hreflangs: [
        { lang: 'en', url: `${FRONTEND_DOMAIN}/packages/${packageData._id}` },
        { lang: 'ar', url: `${FRONTEND_DOMAIN}/packages/${packageData._id}` },
        { lang: 'x-default', url: canonicalUrl }
      ]
    });

    // Structured data for Package
    const packagePrice = packageData.price - (packageData.discountPrice || 0);
    this.seoService.injectStructuredData({
      '@context': 'https://schema.org',
      '@type': 'Product',
      name: localizedName,
      image: ogImage,
      description,
      sku: packageData._id || packageData.id,
      offers: {
        '@type': 'Offer',
        priceCurrency: 'EGP',
        price: packagePrice.toFixed(2),
        availability: packageData.isActive && packageData.stock > 0
          ? 'https://schema.org/InStock'
          : 'https://schema.org/OutOfStock',
        url: canonicalUrl
      },
      aggregateRating: packageData.averageRating && packageData.reviewCount
        ? {
            '@type': 'AggregateRating',
            ratingValue: packageData.averageRating,
            reviewCount: packageData.reviewCount
          }
        : undefined
    });
  }
} 