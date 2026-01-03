import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from '../../../../environments/environment';
import { BaseResponse } from '../../../core/models/baseResponse';

/**
 * Payment method types
 */
export enum PaymentMethodType {
  CARD = 'card',
  WALLET = 'wallet',
}

/**
 * Wallet provider types
 */
export enum WalletType {
  VODAFONE = 'vodafone',
  ORANGE = 'orange',
  ETISALAT = 'etisalat',
  WE = 'we',
}

export interface InitiatePaymentRequest {
  orderId?: string; // Optional - order will be created after successful payment if not provided
  amount: number;
  paymentMethod: PaymentMethodType; // Required: 'card' or 'wallet'
  currency?: string;
  firstName?: string;
  lastName?: string;
  email?: string;
  phoneNumber?: string;
  // Wallet-specific fields (required when paymentMethod === 'wallet')
  phone_number?: string; // Egyptian format: starts with 01, length 11
  wallet_type?: WalletType; // vodafone | orange | etisalat | we
  successUrl?: string;
  failureUrl?: string;
  metadata?: Record<string, any>;
}

export interface InitiatePaymentResponse {
  paymentKey: string;
  iframeUrl?: string; // Present for card payments
  redirectUrl?: string; // Present for wallet payments
  transactionId: string;
}

export interface PaymentTransaction {
  _id: string;
  orderId: string;
  paymentKey: string;
  transactionId: string;
  amount: number;
  currency: string;
  status: string;
  isProcessed: boolean;
  createdAt: string;
  updatedAt: string;
}

@Injectable({
  providedIn: 'root'
})
export class PaymobService {
  private apiUrl = `${environment.apiUrl}/paymob`;

  constructor(private http: HttpClient) {}

  /**
   * Initiate Paymob payment
   */
  initiatePayment(request: InitiatePaymentRequest): Observable<InitiatePaymentResponse> {
    return this.http.post<BaseResponse<InitiatePaymentResponse>>(`${this.apiUrl}/initiate`, request).pipe(
      map(response => response.data)
    );
  }

  /**
   * Get payment transaction by ID
   */
  getTransaction(transactionId: string): Observable<PaymentTransaction> {
    return this.http.get<PaymentTransaction>(`${this.apiUrl}/transaction/${transactionId}`);
  }

  /**
   * Get payment transaction by order ID
   */
  getTransactionByOrderId(orderId: string): Observable<PaymentTransaction> {
    return this.http.get<PaymentTransaction>(`${this.apiUrl}/order/${orderId}`);
  }

  /**
   * Handle payment callback (for redirect-based flows)
   */
  handleCallback(callbackData: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/callback`, callbackData);
  }
}

