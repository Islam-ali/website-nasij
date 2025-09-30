import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { ICheckout, ICreateOrder, IOrderItem, IPaymentInfo, IPackageItem } from '../models/checkout';
import { OrderItemType, PaymentStatus, PaymentMethod } from '../models/order.enum';
import { ICartItem } from '../../cart/models/cart.interface';
import { EnumProductVariant, ProductVariantAttribute } from '../../products/models/product.interface';
import { MultilingualText } from '../../../core/models/multi-language';

@Injectable({
  providedIn: 'root'
})
export class CheckoutService {
  private apiUrl = `${environment.apiUrl}/orders`;
 
  constructor(private http: HttpClient) { }

  // Create a new order using new backend structure
  createOrder(orderData: ICreateOrder): Observable<any> {
    console.log('🚀 Creating order with new structure:', orderData);
    return this.http.post(this.apiUrl, orderData);
  }

  // Legacy method for backward compatibility
  createOrderLegacy(checkoutData: ICheckout): Observable<any> {
    console.log('🔄 Using legacy checkout method:', checkoutData);
    return this.http.post(this.apiUrl, checkoutData);
  }
  getCountries(): Observable<any> {
    return this.http.get(`${environment.apiUrl}/countries`);
  }
  getStates(countryId: string): Observable<any> {
    return this.http.get(`${environment.apiUrl}/states/country/${countryId}`);
  }

  uploadPaymentImage(file: File): Observable<any> {
    const formData = new FormData();
    formData.append('file', file);
    return this.http.post(`${environment.apiUrl}/file-upload/upload`, formData);
  }

  // Convert cart items to order items (including packages)
  convertCartItemsToOrderItems(cartItems: ICartItem[]): IOrderItem[] {
    return cartItems.map(item => {
      // Check if item is a package (has packageId)
      if (item.packageId && item.itemType === 'Package') {
        return {
          itemType: OrderItemType.PACKAGE,
          itemId: item.packageId,
          quantity: Number(item.quantity),
          price: Number(item.price),
          discountPrice: Number(item.discount) || Number(item.price),
          packageItems: this.cleanPackageItems(item.packageItems || [])
        };
      } else if (item.productId && (item.itemType === 'Product' || !item.itemType)) {
        // Regular product (default if no itemType specified)
        return {
          itemType: OrderItemType.PRODUCT,
          itemId: item.productId,
          quantity: Number(item.quantity),
          price: Number(item.price),
          discountPrice: Number(item.discount) || Number(item.price),
          selectedVariants: item.selectedVariants
        };
      } else {
        // Fallback - this shouldn't happen in normal flow
        console.error('Invalid cart item:', item);
        throw new Error(`Cart item must have either productId or packageId. Item: ${JSON.stringify(item)}`);
      }
    });
  }

  // Clean package items by removing unnecessary properties
  private cleanPackageItems(packageItems: IPackageItem[]): IPackageItem[] {
    return packageItems.map(packageItem => {
      const cleanedItem: IPackageItem = {
        productId: packageItem.productId,
        quantity: packageItem.quantity,
        selectedVariants: packageItem.selectedVariants.map(variant => ({
          _id: variant._id,
          variant: variant.variant,
          value: variant.value,
          image: variant.image
        }))
      };
      return cleanedItem;
    });
  }

  // Build selected variants from cart item
  private buildSelectedVariants(cartItem: ICartItem): ProductVariantAttribute[] {
    const variants: ProductVariantAttribute[] = [];
    
    if (cartItem.selectedVariants && cartItem.selectedVariants.length > 0) {
      cartItem.selectedVariants.forEach(variant => {
        variants.push({
          _id: variant._id,
          variant: variant.variant,
          value: variant.value,
          image: variant.image
        });
      });
    }
    
    return variants;
  }

  // Create payment info - updated to match backend DTO
  createPaymentInfo(paymentMethod: PaymentMethod, cashAmount?: number, notes?: string): IPaymentInfo {
    return {
      paymentStatus: PaymentStatus.PENDING,
      paymentMethod: paymentMethod,
      cashPayment: cashAmount,
      notes: notes
    };
  }

  // Process payment for an order
  processPayment(orderId: string, paymentData: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/${orderId}/process-payment`, paymentData);
  }

  // Update payment status
  updatePayment(orderId: string, paymentUpdate: any): Observable<any> {
    return this.http.patch(`${this.apiUrl}/${orderId}/payment`, paymentUpdate);
  }

  // Get order by ID
  getOrder(orderId: string): Observable<any> {
    return this.http.get(`${this.apiUrl}/${orderId}`);
  }

  // Get orders for customer
  getCustomerOrders(customerId: string): Observable<any> {
    return this.http.get(`${this.apiUrl}?customerId=${customerId}`);
  }

  // Get available shipping methods
  getShippingMethods(): Observable<any> {
    return this.http.get(`${this.apiUrl}/shipping/methods`);
  }

  // Get available payment methods
  getPaymentMethods(): Observable<any> {
    return this.http.get(`${this.apiUrl}/payment/methods`);
  }

  // Calculate shipping cost
  calculateShipping(zipCode: string): Observable<any> {
    return this.http.get(`${this.apiUrl}/shipping/calculate?zipCode=${zipCode}`);
  }

  // Validate coupon code
  validateCoupon(code: string): Observable<any> {
    return this.http.get(`${this.apiUrl}/coupons/validate?code=${code}`);
  }
}
