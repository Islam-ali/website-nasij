import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { ICheckout } from '../models/checkout';

@Injectable({
  providedIn: 'root'
})
export class CheckoutService {
  private apiUrl = `${environment.apiUrl}/orders`;

  constructor(private http: HttpClient) { }

  // Create a new order
  createOrder(checkoutData: ICheckout): Observable<any> {
    console.log('Sending order data to:', this.apiUrl);
    console.log('Order data:', checkoutData);
    return this.http.post(this.apiUrl, checkoutData);
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
