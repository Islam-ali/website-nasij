import { Inject, PLATFORM_ID, Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { QueryParamsService } from '../../../shared/services/query-params.service';
import { isPlatformBrowser } from '@angular/common';
import { secureEncodeUrl } from '../../../core/utils/secure-query';

@Injectable({
  providedIn: 'root'
})
export class PackageUrlService {

  constructor(
    private router: Router,
      private queryParamsService: QueryParamsService,
    @Inject(PLATFORM_ID) private platformId: Object
  ) { }

  /**
   * Navigate to package details with encoded package data
   * @param packageData - Package data to encode
   * @param route - Route to navigate to (default: '/packages/details')
   */
  navigateToPackageWithData(packageData: {
    packageId: string;
    quantity: number;
    price: number;
    productName: string;
    image: string;
    packageItems?: any[];
    discount?: number;
    selectedVariants?: any[];
  }, route: string = '/packages/details'): void {
    try {
      const encodedPackage = this.queryParamsService.encodePackage(packageData);
      this.router.navigate([route], {
        queryParams: {
          package: encodedPackage,
          source: 'encoded'
        }
      });
    } catch (error) {
      // Fallback to regular navigation
      this.router.navigate([route, packageData.packageId]);
    }
  }

  /**
   * Navigate to checkout with encoded package data
   * @param packageData - Package data to encode
   */
  navigateToCheckoutWithPackage(packageData: {
    packageId: string;
    quantity: number;
    price: number;
    productName: string;
    image: string;
    packageItems?: any[];
    discount?: number;
    selectedVariants?: any[];
  }): void {
    try {
      debugger;

      const secureQuery = secureEncodeUrl(packageData);
      this.router.navigate(['/checkout'], {
        queryParams: {
          buyNow: secureQuery,
        }
      });
    } catch (error) {
      // Fallback to regular checkout
      this.router.navigate(['/checkout']);
    }
  }

  /**
   * Navigate to cart with encoded package data
   * @param packageData - Package data to encode
   */
  navigateToCartWithPackage(packageData: {
    packageId: string;
    quantity: number;
    price: number;
    productName: string;
    image: string;
    packageItems?: any[];
    discount?: number;
    selectedVariants?: any;
  }): void {
    try {
      const encodedPackage = this.queryParamsService.encodePackage(packageData);
      this.router.navigate(['/cart'], {
        queryParams: {
          addPackage: encodedPackage,
          source: 'package'
        }
      });
    } catch (error) {
      // Fallback to regular cart
      this.router.navigate(['/cart']);
    }
  }

  /**
   * Navigate to checkout with multiple encoded items
   * @param items - Array of items (products and packages) to encode
   */
  navigateToCheckoutWithItems(items: any[]): void {
    try {
      const encodedItems = this.queryParamsService.encodeItems(items);
      this.router.navigate(['/checkout'], {
        queryParams: {
          items: encodedItems,
          buyNow: 'true',
          source: 'items'
        }
      });
    } catch (error) {
      // Fallback to regular checkout
      this.router.navigate(['/checkout']);
    }
  }

  /**
   * Navigate to checkout with encoded cart data
   * @param cartData - Cart data to encode
   */
  navigateToCheckoutWithCart(cartData: {
    items: any[];
    summary: {
      subtotal: number;
      shipping: number;
      discount: number;
      total: number;
      itemsCount: number;
    };
  }): void {
    try {
      const encodedCart = this.queryParamsService.encodeCart(cartData);
      this.router.navigate(['/checkout'], {
        queryParams: {
          cart: encodedCart,
          source: 'cart'
        }
      });
    } catch (error) {
      // Fallback to regular checkout
      this.router.navigate(['/checkout']);
    }
  }

  /**
   * Get package data from URL parameters
   * @param queryParams - Query parameters from ActivatedRoute
   * @returns Decoded package data or null
   */
  getPackageFromUrl(queryParams: any): {
    type: string;
    data: any;
    timestamp: number;
  } | null {
    try {
      const encodedPackage = queryParams['package'];
      if (encodedPackage) {
        // Validate the encoded data
        if (this.queryParamsService.validateEncodedData(encodedPackage, 24 * 60 * 60 * 1000)) { // 24 hours
          return this.queryParamsService.decodePackage(encodedPackage);
        } else {
          return null;
        }
      }
      return null;
    } catch (error) {
      return null;
    }
  }

  /**
   * Get items data from URL parameters
   * @param queryParams - Query parameters from ActivatedRoute
   * @returns Decoded items data or null
   */
  getItemsFromUrl(queryParams: any): {
    type: string;
    data: any[];
    count: number;
    timestamp: number;
  } | null {
    try {
      const encodedItems = queryParams['items'];
      if (encodedItems) {
        // Validate the encoded data
        if (this.queryParamsService.validateEncodedData(encodedItems, 24 * 60 * 60 * 1000)) { // 24 hours
          return this.queryParamsService.decodeItems(encodedItems);
        } else {
          return null;
        }
      }
      return null;
    } catch (error) {
      return null;
    }
  }

  /**
   * Get cart data from URL parameters
   * @param queryParams - Query parameters from ActivatedRoute
   * @returns Decoded cart data or null
   */
  getCartFromUrl(queryParams: any): {
    type: string;
    data: any;
    timestamp: number;
  } | null {
    try {
      const encodedCart = queryParams['cart'];
      if (encodedCart) {
        // Validate the encoded data
        if (this.queryParamsService.validateEncodedData(encodedCart, 24 * 60 * 60 * 1000)) { // 24 hours
          return this.queryParamsService.decodeCart(encodedCart);
        } else {
          return null;
        }
      }
      return null;
    } catch (error) {
      return null;
    }
  }

  /**
   * Create shareable URL with encoded package data
   * @param packageData - Package data to encode
   * @param baseUrl - Base URL (default: current domain)
   * @returns Shareable URL with encoded package data
   */
  createShareablePackageUrl(packageData: {
    packageId: string;
    quantity: number;
    price: number;
    productName: string;
    image: string;
    packageItems?: any[];
    discount?: number;
    selectedVariants?: any[];
  }, baseUrl?: string): string {
    if (isPlatformBrowser(this.platformId)) {

    try {
      const encodedPackage = this.queryParamsService.encodePackage(packageData);
      const url = baseUrl || window.location.origin;
      return `${url}/packages/details?package=${encodedPackage}&source=shared`;
    } catch (error) {
      // Fallback to regular URL
      return `${baseUrl || window.location.origin}/packages/details/${packageData.packageId}`;
    }
    }
    return '';
  }

  /**
   * Create shareable URL with encoded items
   * @param items - Array of items to encode
   * @param baseUrl - Base URL (default: current domain)
   * @returns Shareable URL with encoded items
   */
  createShareableItemsUrl(items: any[], baseUrl?: string): string {
    if (isPlatformBrowser(this.platformId)) {

    try {
      const encodedItems = this.queryParamsService.encodeItems(items);
      const url = baseUrl || window.location.origin;
      return `${url}/checkout?items=${encodedItems}&source=shared`;
    } catch (error) {
      // Fallback to regular checkout
      return `${baseUrl || window.location.origin}/checkout`;
    }
    }
    return '';
  }

  /**
   * Check if URL contains encoded data
   * @param queryParams - Query parameters to check
   * @returns True if URL contains encoded data
   */
  hasEncodedData(queryParams: any): boolean {
    return !!(queryParams['package'] || queryParams['items'] || queryParams['cart'] || queryParams['addPackage']);
  }

  /**
   * Clear encoded data from URL
   * @param route - Current route
   */
  clearEncodedDataFromUrl(route: any): void {
    try {
      const queryParams = { ...route.snapshot.queryParams };
      delete queryParams['package'];
      delete queryParams['items'];
      delete queryParams['cart'];
      delete queryParams['addPackage'];
      delete queryParams['source'];
      delete queryParams['buyNow'];
      
      this.router.navigate([], {
        relativeTo: route,
        queryParams: queryParams,
        queryParamsHandling: 'merge'
      });
    } catch (error) {
    }
  }

  /**
   * Get all encoded data from URL
   * @param queryParams - Query parameters from ActivatedRoute
   * @returns Object containing all decoded data
   */
  getAllEncodedDataFromUrl(queryParams: any): {
    package?: any;
    items?: any;
    cart?: any;
    addPackage?: any;
  } {
    const result: any = {};
    
    try {
      if (queryParams['package']) {
        result.package = this.getPackageFromUrl(queryParams);
      }
      
      if (queryParams['items']) {
        result.items = this.getItemsFromUrl(queryParams);
      }
      
      if (queryParams['cart']) {
        result.cart = this.getCartFromUrl(queryParams);
      }
      
      if (queryParams['addPackage']) {
        result.addPackage = this.getPackageFromUrl({ package: queryParams['addPackage'] });
      }
    } catch (error) {
    }
    
    return result;
  }
}