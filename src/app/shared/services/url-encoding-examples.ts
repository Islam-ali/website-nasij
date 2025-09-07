import { QueryParamsService } from './query-params.service';
import { PackageUrlService } from '../../features/packages/services/package-url.service';
import { ProductUrlService } from '../../features/products/services/product-url.service';

/**
 * Practical examples of using URL Encoding Services
 */

// Example 1: Basic Package Encoding/Decoding
export function basicPackageExample() {
  const queryParamsService = new QueryParamsService();
  
  // Package data to encode
  const packageData = {
    packageId: 'summer_package_001',
    quantity: 2,
    price: 149.99,
    productName: 'Summer Essentials Package',
    image: 'https://example.com/summer-package.jpg',
    packageItems: [
      {
        productId: 'tshirt_001',
        quantity: 1,
        selectedVariants: [
          { variant: 'color', value: 'blue' },
          { variant: 'size', value: 'medium' }
        ]
      },
      {
        productId: 'shorts_001',
        quantity: 1,
        selectedVariants: [
          { variant: 'color', value: 'white' },
          { variant: 'size', value: 'small' }
        ]
      }
    ],
    discount: 20.00,
    selectedVariants: {
      'tshirt_001': {
        1: { color: 'blue', size: 'medium' }
      },
      'shorts_001': {
        1: { color: 'white', size: 'small' }
      }
    }
  };

  // Encode package data
  const encodedPackage = queryParamsService.encodePackage(packageData);
  console.log('Encoded Package:', encodedPackage);

  // Decode package data
  const decodedPackage = queryParamsService.decodePackage(encodedPackage);
  console.log('Decoded Package:', decodedPackage);

  // Validate encoded data
  const isValid = queryParamsService.validateEncodedData(encodedPackage);
  console.log('Is Valid:', isValid);
}

// Example 2: Product with Variants
export function productWithVariantsExample() {
  const queryParamsService = new QueryParamsService();
  
  // Product data with variants
  const productData = {
    productId: 'cotton_tshirt_001',
    quantity: 3,
    price: 29.99,
    productName: 'Premium Cotton T-Shirt',
    image: 'https://example.com/tshirt.jpg',
    color: 'red',
    size: 'large',
    discount: 5.00
  };

  // Encode product data
  const encodedProduct = queryParamsService.encodeProduct(productData);
  console.log('Encoded Product:', encodedProduct);

  // Decode product data
  const decodedProduct = queryParamsService.decodeProduct(encodedProduct);
  console.log('Decoded Product:', decodedProduct);
}

// Example 3: Multiple Items (Mixed Cart)
export function multipleItemsExample() {
  const queryParamsService = new QueryParamsService();
  
  // Mixed items (products and packages)
  const items = [
    {
      itemType: 'product',
      productId: 'tshirt_001',
      quantity: 2,
      price: 29.99,
      productName: 'Cotton T-Shirt',
      color: 'blue',
      size: 'medium'
    },
    {
      itemType: 'package',
      packageId: 'summer_package_001',
      quantity: 1,
      price: 149.99,
      productName: 'Summer Package',
      packageItems: [
        {
          productId: 'shorts_001',
          quantity: 1,
          selectedVariants: [
            { variant: 'color', value: 'white' }
          ]
        }
      ]
    }
  ];

  // Encode multiple items
  const encodedItems = queryParamsService.encodeItems(items);
  console.log('Encoded Items:', encodedItems);

  // Decode multiple items
  const decodedItems = queryParamsService.decodeItems(encodedItems);
  console.log('Decoded Items:', decodedItems);
}

// Example 4: Complete Cart State
export function cartStateExample() {
  const queryParamsService = new QueryParamsService();
  
  // Complete cart state
  const cartData = {
    items: [
      {
        itemType: 'product',
        productId: 'tshirt_001',
        quantity: 2,
        price: 29.99,
        productName: 'Cotton T-Shirt',
        color: 'red',
        size: 'large'
      },
      {
        itemType: 'package',
        packageId: 'summer_package_001',
        quantity: 1,
        price: 149.99,
        productName: 'Summer Package',
        packageItems: []
      }
    ],
    summary: {
      subtotal: 209.97,
      shipping: 10.00,
      discount: 15.00,
      total: 204.97,
      itemsCount: 3
    }
  };

  // Encode cart state
  const encodedCart = queryParamsService.encodeCart(cartData);
  console.log('Encoded Cart:', encodedCart);

  // Decode cart state
  const decodedCart = queryParamsService.decodeCart(encodedCart);
  console.log('Decoded Cart:', decodedCart);
}

// Example 5: URL Creation and Parsing
export function urlCreationExample() {
  const queryParamsService = new QueryParamsService();
  
  // Create URL with encoded parameters
  const baseUrl = 'https://yoursite.com/checkout';
  const params = {
    package: {
      packageId: 'summer_package_001',
      quantity: 1,
      price: 149.99,
      productName: 'Summer Package'
    },
    source: 'shared'
  };

  // Create URL with encoded parameters
  const urlWithEncodedParams = queryParamsService.createUrlWithEncodedParams(baseUrl, params);
  console.log('URL with Encoded Params:', urlWithEncodedParams);

  // Parse URL and decode parameters
  const decodedParams = queryParamsService.parseUrlWithEncodedParams(urlWithEncodedParams, ['package']);
  console.log('Decoded Params:', decodedParams);
}

// Example 6: Package URL Service Usage
export function packageUrlServiceExample(packageUrlService: PackageUrlService) {
  // Package data
  const packageData = {
    packageId: 'summer_package_001',
    quantity: 1,
    price: 149.99,
    productName: 'Summer Essentials Package',
    image: 'https://example.com/summer-package.jpg',
    packageItems: [
      {
        productId: 'tshirt_001',
        quantity: 1,
        selectedVariants: [
          { variant: 'color', value: 'blue' },
          { variant: 'size', value: 'medium' }
        ]
      }
    ],
    discount: 20.00
  };

  // Navigate to package details with encoded data
  packageUrlService.navigateToPackageWithData(packageData);

  // Navigate to cart with encoded package data
  packageUrlService.navigateToCartWithPackage(packageData);

  // Navigate to checkout with encoded package data
  packageUrlService.navigateToCheckoutWithPackage(packageData);

  // Create shareable URL
  const shareableUrl = packageUrlService.createShareablePackageUrl(packageData);
  console.log('Shareable Package URL:', shareableUrl);
}

// Example 7: Product URL Service Usage
export function productUrlServiceExample(productUrlService: ProductUrlService) {
  // Product data
  const productData = {
    productId: 'cotton_tshirt_001',
    quantity: 2,
    price: 29.99,
    productName: 'Premium Cotton T-Shirt',
    image: 'https://example.com/tshirt.jpg',
    color: 'red',
    size: 'large',
    discount: 5.00
  };

  // Navigate to product details with encoded data
  productUrlService.navigateToProductWithData(productData);

  // Navigate to cart with encoded product data
  productUrlService.navigateToCartWithProduct(productData);

  // Navigate to checkout with encoded product data
  productUrlService.navigateToCheckoutWithProduct(productData);

  // Create shareable URL
  const shareableUrl = productUrlService.createShareableProductUrl(productData);
  console.log('Shareable Product URL:', shareableUrl);
}

// Example 8: Error Handling
export function errorHandlingExample() {
  const queryParamsService = new QueryParamsService();
  
  try {
    // Try to decode invalid data
    const invalidEncoded = 'invalid_base64_string';
    const decoded = queryParamsService.decode(invalidEncoded);
    console.log('Decoded:', decoded);
  } catch (error) {
    console.error('Decode error:', error.message);
    // Handle error gracefully
  }

  try {
    // Try to decode expired data
    const expiredEncoded = 'eyJ0eXBlIjoicGFja2FnZSIsImRhdGEiOnt9LCJ0aW1lc3RhbXAiOjE2MDAwMDAwMDB9'; // Old timestamp
    const isValid = queryParamsService.validateEncodedData(expiredEncoded, 24 * 60 * 60 * 1000); // 24 hours
    console.log('Is Valid (with age check):', isValid);
  } catch (error) {
    console.error('Validation error:', error.message);
  }
}

// Example 9: Compression for Large Data
export function compressionExample() {
  const queryParamsService = new QueryParamsService();
  
  // Large data object
  const largeData = {
    items: Array.from({ length: 100 }, (_, i) => ({
      productId: `product_${i}`,
      quantity: Math.floor(Math.random() * 5) + 1,
      price: Math.random() * 100,
      productName: `Product ${i}`,
      variants: {
        color: ['red', 'blue', 'green'][Math.floor(Math.random() * 3)],
        size: ['small', 'medium', 'large'][Math.floor(Math.random() * 3)]
      }
    })),
    metadata: {
      timestamp: Date.now(),
      source: 'bulk_import',
      version: '1.0.0'
    }
  };

  // Compress and encode large data
  const compressed = queryParamsService.compressAndEncode(largeData);
  console.log('Compressed size:', compressed.length);

  // Decompress and decode
  const decompressed = queryParamsService.decompressAndDecode(compressed);
  console.log('Decompressed items count:', decompressed.items.length);
}

// Example 10: Real-world Component Integration
export function componentIntegrationExample() {
  // This would be used in actual Angular components
  
  // In Package Details Component
  const packageDetailsIntegration = {
    // Load package with encoded data
    loadPackageWithEncodedData: (queryParams: any, packageUrlService: PackageUrlService) => {
      const encodedPackageData = packageUrlService.getPackageFromUrl(queryParams);
      
      if (encodedPackageData && encodedPackageData.data) {
        // Pre-fill form with encoded data
        return {
          packageId: encodedPackageData.data.packageId,
          quantity: encodedPackageData.data.quantity,
          selectedVariants: encodedPackageData.data.selectedVariants
        };
      }
      
      return null;
    },

    // Add to cart with encoded navigation
    addToCartWithEncodedNavigation: (packageData: any, packageUrlService: PackageUrlService) => {
      const packageDataForUrl = {
        packageId: packageData._id,
        quantity: packageData.quantity,
        price: packageData.price,
        productName: packageData.name,
        image: packageData.images?.[0]?.url || '',
        packageItems: packageData.items.map(item => ({
          productId: item.productId._id,
          quantity: item.quantity,
          selectedVariants: item.selectedVariants
        })),
        discount: packageData.discount || 0
      };

      packageUrlService.navigateToCartWithPackage(packageDataForUrl);
    }
  };

  // In Cart Component
  const cartIntegration = {
    // Handle encoded data from URL
    handleEncodedData: (queryParams: any, packageUrlService: PackageUrlService, cartService: any) => {
      if (queryParams['addPackage']) {
        const encodedPackageData = packageUrlService.getPackageFromUrl({ 
          package: queryParams['addPackage'] 
        });
        
        if (encodedPackageData && encodedPackageData.data) {
          const packageItem = {
            packageId: encodedPackageData.data.packageId,
            quantity: encodedPackageData.data.quantity || 1,
            price: encodedPackageData.data.price,
            productName: encodedPackageData.data.productName,
            image: encodedPackageData.data.image,
            packageItems: encodedPackageData.data.packageItems || [],
            discount: encodedPackageData.data.discount || 0,
            itemType: 'package' as const
          };

          return cartService.addPackageToCart(packageItem);
        }
      }
      
      return null;
    }
  };

  // In Checkout Component
  const checkoutIntegration = {
    // Handle encoded checkout data
    handleEncodedCheckoutData: (queryParams: any, packageUrlService: PackageUrlService) => {
      if (queryParams['package']) {
        const encodedPackageData = packageUrlService.getPackageFromUrl(queryParams);
        if (encodedPackageData && encodedPackageData.data) {
          return {
            isBuyNow: true,
            items: [{
              packageId: encodedPackageData.data.packageId,
              quantity: encodedPackageData.data.quantity || 1,
              price: encodedPackageData.data.price,
              productName: encodedPackageData.data.productName,
              image: encodedPackageData.data.image,
              packageItems: encodedPackageData.data.packageItems || [],
              discount: encodedPackageData.data.discount || 0,
              itemType: 'package' as const
            }]
          };
        }
      }
      
      return null;
    }
  };

  return {
    packageDetails: packageDetailsIntegration,
    cart: cartIntegration,
    checkout: checkoutIntegration
  };
}

// Export all examples
export const urlEncodingExamples = {
  basicPackage: basicPackageExample,
  productWithVariants: productWithVariantsExample,
  multipleItems: multipleItemsExample,
  cartState: cartStateExample,
  urlCreation: urlCreationExample,
  packageUrlService: packageUrlServiceExample,
  productUrlService: productUrlServiceExample,
  errorHandling: errorHandlingExample,
  compression: compressionExample,
  componentIntegration: componentIntegrationExample
};