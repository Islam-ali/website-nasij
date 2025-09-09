import { Inject, Injectable, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

@Injectable({
  providedIn: 'root'
})
export class QueryParamsService {

  constructor(
    @Inject(PLATFORM_ID) private platformId: Object
  ) { }

  /**
   * Encode data to base64 string for URL parameters
   * @param data - The data to encode
   * @returns Base64 encoded string
   */
  encode(data: any): string {
    try {
      const jsonString = JSON.stringify(data);
      const base64String = btoa(unescape(encodeURIComponent(jsonString)));
      return base64String;
    } catch (error) {
      console.error('Error encoding data:', error);
      throw new Error('Failed to encode data');
    }
  }

  /**
   * Decode base64 string back to original data
   * @param encodedString - The base64 encoded string
   * @returns Decoded data
   */
  decode<T = any>(encodedString: string): T {
    try {
      const jsonString = decodeURIComponent(escape(atob(encodedString)));
      return JSON.parse(jsonString);
    } catch (error) {
      console.error('Error decoding data:', error);
      throw new Error('Failed to decode data');
    }
  }

  /**
   * Encode package data for URL parameters
   * @param packageData - Package data to encode
   * @returns Encoded package string
   */
  encodePackage(packageData: {
    packageId: string;
    quantity: number;
    price: number;
    productName: string;
    image: string;
    packageItems?: any[];
    discount?: number;
    selectedVariants?: any;
  }): string {
    const packageInfo = {
      type: 'package',
      data: packageData,
      timestamp: Date.now()
    };
    console.log('Package info:', packageInfo);
    debugger;
    return this.encode(packageInfo);
  }

  /**
   * Decode package data from URL parameters
   * @param encodedPackage - Encoded package string
   * @returns Decoded package data
   */
  decodePackage(encodedPackage: string): {
    type: string;
    data: any;
    timestamp: number;
  } {
    return this.decode(encodedPackage);
  }

  /**
   * Encode product data for URL parameters
   * @param productData - Product data to encode
   * @returns Encoded product string
   */
  encodeProduct(productData: {
    productId: string;
    quantity: number;
    price: number;
    productName: string;
    image: string;
    color?: string;
    size?: string;
    discount?: number;
  }): string {
    const productInfo = {
      type: 'product',
      data: productData,
      timestamp: Date.now()
    };
    return this.encode(productInfo);
  }

  /**
   * Decode product data from URL parameters
   * @param encodedProduct - Encoded product string
   * @returns Decoded product data
   */
  decodeProduct(encodedProduct: string): {
    type: string;
    data: any;
    timestamp: number;
  } {
    return this.decode(encodedProduct);
  }

  /**
   * Encode multiple items (products and packages) for URL parameters
   * @param items - Array of items to encode
   * @returns Encoded items string
   */
  encodeItems(items: any[]): string {
    const itemsInfo = {
      type: 'items',
      data: items,
      count: items.length,
      timestamp: Date.now()
    };
    return this.encode(itemsInfo);
  }

  /**
   * Decode multiple items from URL parameters
   * @param encodedItems - Encoded items string
   * @returns Decoded items data
   */
  decodeItems(encodedItems: string): {
    type: string;
    data: any[];
    count: number;
    timestamp: number;
  } {
    return this.decode(encodedItems);
  }

  /**
   * Encode cart data for URL parameters
   * @param cartData - Cart data to encode
   * @returns Encoded cart string
   */
  encodeCart(cartData: {
    items: any[];
    summary: {
      subtotal: number;
      shipping: number;
      discount: number;
      total: number;
      itemsCount: number;
    };
  }): string {
    const cartInfo = {
      type: 'cart',
      data: cartData,
      timestamp: Date.now()
    };
    return this.encode(cartInfo);
  }

  /**
   * Decode cart data from URL parameters
   * @param encodedCart - Encoded cart string
   * @returns Decoded cart data
   */
  decodeCart(encodedCart: string): {
    type: string;
    data: any;
    timestamp: number;
  } {
    return this.decode(encodedCart);
  }

  /**
   * Create URL with encoded parameters
   * @param baseUrl - Base URL
   * @param params - Parameters to encode
   * @returns URL with encoded parameters
   */
  createUrlWithEncodedParams(baseUrl: string, params: { [key: string]: any }): string {
    if (isPlatformBrowser(this.platformId)) {

    const url = new URL(baseUrl, window.location.origin);
    
    Object.keys(params).forEach(key => {
      if (params[key] !== null && params[key] !== undefined) {
        const encodedValue = this.encode(params[key]);
        url.searchParams.set(key, encodedValue);
      }
    });
    
    return url.toString();
    }
    return '';
  }

  /**
   * Parse URL and decode parameters
   * @param url - URL to parse
   * @param paramKeys - Keys of parameters to decode
   * @returns Object with decoded parameters
   */
  parseUrlWithEncodedParams(url: string, paramKeys: string[]): { [key: string]: any } {
    const urlObj = new URL(url);
    const decodedParams: { [key: string]: any } = {};
    
    paramKeys.forEach(key => {
      const encodedValue = urlObj.searchParams.get(key);
      if (encodedValue) {
        try {
          decodedParams[key] = this.decode(encodedValue);
        } catch (error) {
          console.error(`Error decoding parameter ${key}:`, error);
          decodedParams[key] = null;
        }
      }
    });
    
    return decodedParams;
  }

  /**
   * Validate encoded data integrity
   * @param encodedString - Encoded string to validate
   * @param maxAge - Maximum age in milliseconds (optional)
   * @returns True if valid, false otherwise
   */
  validateEncodedData(encodedString: string, maxAge?: number): boolean {
    try {
      const decoded = this.decode(encodedString);
      
      // Check if it has required structure
      if (!decoded.type || !decoded.data || !decoded.timestamp) {
        return false;
      }
      
      // Check age if maxAge is provided
      if (maxAge) {
        const age = Date.now() - decoded.timestamp;
        if (age > maxAge) {
          console.warn('Encoded data is too old:', age, 'ms');
          return false;
        }
      }
      
      return true;
    } catch (error) {
      console.error('Invalid encoded data:', error);
      return false;
    }
  }

  /**
   * Compress data before encoding (for large objects)
   * @param data - Data to compress
   * @returns Compressed and encoded string
   */
  compressAndEncode(data: any): string {
    try {
      // Simple compression by removing unnecessary whitespace
      const jsonString = JSON.stringify(data);
      const compressed = jsonString.replace(/\s+/g, ' ').trim();
      return this.encode(compressed);
    } catch (error) {
      console.error('Error compressing and encoding data:', error);
      throw new Error('Failed to compress and encode data');
    }
  }

  /**
   * Decompress and decode data
   * @param encodedString - Encoded string to decompress
   * @returns Decompressed and decoded data
   */
  decompressAndDecode<T = any>(encodedString: string): T {
    try {
      const compressed = this.decode<string>(encodedString);
      return JSON.parse(compressed);
    } catch (error) {
      console.error('Error decompressing and decoding data:', error);
      throw new Error('Failed to decompress and decode data');
    }
  }
}