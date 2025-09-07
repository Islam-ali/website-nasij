import { CartService } from '../services/cart.service';
import { IPackageItem } from '../../checkout/models/checkout';

/**
 * Example usage of Cart Service with Packages
 */

// Example: Adding a package to cart
export function addPackageToCartExample(cartService: CartService) {
  const packageData = {
    packageId: '507f1f77bcf86cd799439013',
    quantity: 1,
    price: 149.99,
    productName: 'Summer Essentials Package',
    image: 'https://example.com/package-image.jpg',
    discount: 20.00,
    packageItems: [
      {
        productId: '507f1f77bcf86cd799439014',
        quantity: 1,
        selectedVariants: [
          { variant: 'color', value: 'blue' },
          { variant: 'size', value: 'medium' }
        ]
      },
      {
        productId: '507f1f77bcf86cd799439015',
        quantity: 2,
        selectedVariants: [
          { variant: 'color', value: 'white' },
          { variant: 'size', value: 'small' }
        ]
      }
    ] as IPackageItem[]
  };

  cartService.addPackageToCart(packageData).subscribe({
    next: (cartState) => {
      console.log('Package added to cart:', cartState);
    },
    error: (error) => {
      console.error('Error adding package to cart:', error);
    }
  });
}

// Example: Adding a regular product to cart
export function addProductToCartExample(cartService: CartService) {
  const productData = {
    productId: '507f1f77bcf86cd799439012',
    quantity: 2,
    price: 29.99,
    productName: 'Cotton T-Shirt',
    image: 'https://example.com/tshirt-image.jpg',
    color: 'red',
    size: 'large',
    discount: 5.00
  };

  cartService.addToCart(productData).subscribe({
    next: (cartState) => {
      console.log('Product added to cart:', cartState);
    },
    error: (error) => {
      console.error('Error adding product to cart:', error);
    }
  });
}

// Example: Mixed cart with products and packages
export function createMixedCartExample(cartService: CartService) {
  // Add a product
  addProductToCartExample(cartService);
  
  // Add a package
  addPackageToCartExample(cartService);
  
  // The cart will now contain both items
  cartService.getCart().subscribe(cartState => {
    console.log('Mixed cart state:', cartState);
    
    // Cart will have:
    // - 1 product (Cotton T-Shirt)
    // - 1 package (Summer Essentials Package)
    
    cartState.items.forEach(item => {
      if (item.itemType === 'package') {
        console.log(`Package: ${item.productName} (${item.packageId})`);
        console.log(`Package items:`, item.packageItems);
      } else {
        console.log(`Product: ${item.productName} (${item.productId})`);
        console.log(`Variants: ${item.color}, ${item.size}`);
      }
    });
  });
}

// Example: Update package quantity
export function updatePackageQuantityExample(cartService: CartService) {
  const packageId = '507f1f77bcf86cd799439013';
  const newQuantity = 2;
  
  cartService.updateQuantity(undefined, newQuantity, undefined, undefined, packageId).subscribe({
    next: (cartState) => {
      console.log('Package quantity updated:', cartState);
    },
    error: (error) => {
      console.error('Error updating package quantity:', error);
    }
  });
}

// Example: Remove package from cart
export function removePackageFromCartExample(cartService: CartService) {
  const packageId = '507f1f77bcf86cd799439013';
  
  cartService.removeItem(undefined, undefined, undefined, packageId).subscribe({
    next: (cartState) => {
      console.log('Package removed from cart:', cartState);
    },
    error: (error) => {
      console.error('Error removing package from cart:', error);
    }
  });
}

// Example: Checkout with mixed cart
export function checkoutMixedCartExample(cartService: CartService, checkoutService: any) {
  cartService.getCart().subscribe(cartState => {
    if (cartState.items.length > 0) {
      // Convert cart items to order items
      const orderItems = checkoutService.convertCartItemsToOrderItems(cartState.items);
      
      console.log('Order items for checkout:', orderItems);
      
      // The order items will include both products and packages
      orderItems.forEach(item => {
        if (item.itemType === 'package') {
          console.log(`Package order item: ${item.itemId}`);
          console.log(`Package items:`, item.packageItems);
        } else {
          console.log(`Product order item: ${item.itemId}`);
          console.log(`Selected variants:`, item.selectedVariants);
        }
      });
    }
  });
}