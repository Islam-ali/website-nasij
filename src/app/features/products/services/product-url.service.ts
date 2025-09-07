import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { QueryParamsService } from '../../../shared/services/query-params.service';

@Injectable({
  providedIn: 'root'
})
export class ProductUrlService {

  constructor(
    private router: Router,
    private queryParamsService: QueryParamsService
  ) { }

  /**
   * Navigate to product details with encoded product data
   * @param productData - Product data to encode
   * @param route - Route to navigate to (default: '/products/details')
   */
  navigateToProductWithData(productData: {
    productId: string;
    quantity: number;
    price: number;
    productName: string;
    image: string;
    color?: string;
    size?: string;
    discount?: number;
  }, route: string = '/products/details'): void {
    try {
      const encodedProduct = this.queryParamsService.encodeProduct(productData);
      this.router.navigate([route], {
        queryParams: {
          product: encodedProduct,
          source: 'encoded'
        }
      });
    } catch (error) {
      console.error('Error navigating with product data:', error);
      // Fallback to regular navigation
      this.router.navigate([route, productData.productId]);
    }
  }

  /**
   * Navigate to checkout with encoded product data
   * @param productData - Product data to encode
   */
  navigateToCheckoutWithProduct(productData: {
    productId: string;
    quantity: number;
    price: number;
    productName: string;
    image: string;
    color?: string;
    size?: string;
    discount?: number;
  }): void {
    try {
      const encodedProduct = this.queryParamsService.encodeProduct(productData);
      this.router.navigate(['/checkout'], {
        queryParams: {
          product: encodedProduct,
          buyNow: 'true',
          source: 'product'
        }
      });
    } catch (error) {
      console.error('Error navigating to checkout with product:', error);
      // Fallback to regular checkout
      this.router.navigate(['/checkout']);
    }
  }

  /**
   * Navigate to cart with encoded product data
   * @param productData - Product data to encode
   */
  navigateToCartWithProduct(productData: {
    productId: string;
    quantity: number;
    price: number;
    productName: string;
    image: string;
    color?: string;
    size?: string;
    discount?: number;
  }): void {
    try {
      const encodedProduct = this.queryParamsService.encodeProduct(productData);
      this.router.navigate(['/cart'], {
        queryParams: {
          addProduct: encodedProduct,
          source: 'product'
        }
      });
    } catch (error) {
      console.error('Error navigating to cart with product:', error);
      // Fallback to regular cart
      this.router.navigate(['/cart']);
    }
  }

  /**
   * Get product data from URL parameters
   * @param queryParams - Query parameters from ActivatedRoute
   * @returns Decoded product data or null
   */
  getProductFromUrl(queryParams: any): {
    type: string;
    data: any;
    timestamp: number;
  } | null {
    try {
      const encodedProduct = queryParams['product'];
      if (encodedProduct) {
        // Validate the encoded data
        if (this.queryParamsService.validateEncodedData(encodedProduct, 24 * 60 * 60 * 1000)) { // 24 hours
          return this.queryParamsService.decodeProduct(encodedProduct);
        } else {
          console.warn('Invalid or expired product data in URL');
          return null;
        }
      }
      return null;
    } catch (error) {
      console.error('Error getting product from URL:', error);
      return null;
    }
  }

  /**
   * Create shareable URL with encoded product data
   * @param productData - Product data to encode
   * @param baseUrl - Base URL (default: current domain)
   * @returns Shareable URL with encoded product data
   */
  createShareableProductUrl(productData: {
    productId: string;
    quantity: number;
    price: number;
    productName: string;
    image: string;
    color?: string;
    size?: string;
    discount?: number;
  }, baseUrl?: string): string {
    try {
      const encodedProduct = this.queryParamsService.encodeProduct(productData);
      const url = baseUrl || window.location.origin;
      return `${url}/products/details?product=${encodedProduct}&source=shared`;
    } catch (error) {
      console.error('Error creating shareable product URL:', error);
      // Fallback to regular URL
      return `${baseUrl || window.location.origin}/products/details/${productData.productId}`;
    }
  }

  /**
   * Check if URL contains encoded product data
   * @param queryParams - Query parameters to check
   * @returns True if URL contains encoded product data
   */
  hasEncodedProductData(queryParams: any): boolean {
    return !!(queryParams['product'] || queryParams['addProduct']);
  }

  /**
   * Clear encoded product data from URL
   * @param route - Current route
   */
  clearEncodedProductDataFromUrl(route: any): void {
    try {
      const queryParams = { ...route.snapshot.queryParams };
      delete queryParams['product'];
      delete queryParams['addProduct'];
      delete queryParams['source'];
      delete queryParams['buyNow'];
      
      this.router.navigate([], {
        relativeTo: route,
        queryParams: queryParams,
        queryParamsHandling: 'merge'
      });
    } catch (error) {
      console.error('Error clearing encoded product data from URL:', error);
    }
  }
}