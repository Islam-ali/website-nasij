import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

export interface Language {
  code: string;
  name: string;
  direction: 'rtl' | 'ltr';
}

export interface Translations {
  [key: string]: {
    ar: string;
    en: string;
  };
}

@Injectable({
  providedIn: 'root'
})
export class LanguageService {
  private currentLanguageSubject = new BehaviorSubject<string>('ar');
  public currentLanguage$ = this.currentLanguageSubject.asObservable();

  private translations: Translations = {
    // Header Section
    'trackYourOrder': {
      ar: 'تتبع طلبك',
      en: 'Track Your Order'
    },
    'orderTrackingSubtitle': {
      ar: 'أدخل رقم طلبك لتتبع حالة الطلب',
      en: 'Enter your order number to track order status'
    },

    // Search Section
    'enterOrderNumber': {
      ar: 'أدخل رقم الطلب (مثال: ORD-12345)',
      en: 'Enter order number (e.g., ORD-12345)'
    },
    'trackOrder': {
      ar: 'تتبع الطلب',
      en: 'Track Order'
    },
    'searching': {
      ar: 'جاري البحث...',
      en: 'Searching...'
    },

    // Error Messages
    'orderNotFound': {
      ar: 'لم يتم العثور على طلب',
      en: 'Order not found'
    },
    'checkOrderNumber': {
      ar: 'تأكد من صحة رقم الطلب وأعد المحاولة',
      en: 'Please check the order number and try again'
    },
    'newSearch': {
      ar: 'بحث جديد',
      en: 'New Search'
    },

    // Order Information
    'orderNumber': {
      ar: 'الطلب رقم:',
      en: 'Order Number:'
    },
    'orderDate': {
      ar: 'تاريخ الطلب:',
      en: 'Order Date:'
    },
    'orderStatus': {
      ar: 'حالة الطلب:',
      en: 'Order Status:'
    },
    'totalAmount': {
      ar: 'إجمالي الطلب:',
      en: 'Total Amount:'
    },
    'paymentMethod': {
      ar: 'طريقة الدفع:',
      en: 'Payment Method:'
    },

    // Order Items Section
    'requestedProducts': {
      ar: 'المنتجات المطلوبة',
      en: 'Requested Products'
    },
    'quantity': {
      ar: 'الكمية:',
      en: 'Quantity:'
    },
    'product': {
      ar: 'منتج',
      en: 'Product'
    },

    // Order Summary Section
    'paymentDetails': {
      ar: 'تفاصيل الدفع',
      en: 'Payment Details'
    },
    'subtotal': {
      ar: 'المجموع الفرعي',
      en: 'Subtotal'
    },
    'shipping': {
      ar: 'الشحن',
      en: 'Shipping'
    },
    'tax': {
      ar: 'الضريبة',
      en: 'Tax'
    },
    'total': {
      ar: 'المجموع الكلي',
      en: 'Total'
    },

    // Action Buttons
    'searchForAnotherOrder': {
      ar: 'بحث عن طلب آخر',
      en: 'Search for Another Order'
    },

    // Status Translations
    'status.pending': {
      ar: 'في الانتظار',
      en: 'Pending'
    },
    'status.confirmed': {
      ar: 'مؤكد',
      en: 'Confirmed'
    },
    'status.received': {
      ar: 'تم الاستلام',
      en: 'Received'
    },
    'status.processing': {
      ar: 'قيد المعالجة',
      en: 'Processing'
    },
    'status.shipped': {
      ar: 'تم الشحن',
      en: 'Shipped'
    },
    'status.delivered': {
      ar: 'تم التسليم',
      en: 'Delivered'
    },
    'status.cancelled': {
      ar: 'ملغي',
      en: 'Cancelled'
    },
    'status.postponed': {
      ar: 'مؤجل',
      en: 'Postponed'
    },
    'status.returned': {
      ar: 'مرتجع',
      en: 'Returned'
    },

    // Payment Method Translations
    'payment.credit_card': {
      ar: 'بطاقة ائتمان',
      en: 'Credit Card'
    },
    'payment.debit_card': {
      ar: 'بطاقة خصم',
      en: 'Debit Card'
    },
    'payment.bank_transfer': {
      ar: 'تحويل بنكي',
      en: 'Bank Transfer'
    },
    'payment.cash_on_delivery': {
      ar: 'الدفع عند الاستلام',
      en: 'Cash on Delivery'
    },
    'payment.vodafone_cash': {
      ar: 'فودافون كاش',
      en: 'Vodafone Cash'
    },
    'payment.paypal': {
      ar: 'باي بال',
      en: 'PayPal'
    },
    'payment.stripe': {
      ar: 'سترايب',
      en: 'Stripe'
    }
  };

  constructor() {
    // Load saved language from localStorage or default to Arabic
    const savedLanguage = localStorage.getItem('selectedLanguage') || 'ar';
    this.setLanguage(savedLanguage);
  }

  setLanguage(languageCode: string): void {
    this.currentLanguageSubject.next(languageCode);
    localStorage.setItem('selectedLanguage', languageCode);
    
    // Update document direction
    const direction = languageCode === 'ar' ? 'rtl' : 'ltr';
    document.documentElement.setAttribute('dir', direction);
    document.documentElement.setAttribute('lang', languageCode);
  }

  getCurrentLanguage(): string {
    return this.currentLanguageSubject.value;
  }

  getAvailableLanguages(): Language[] {
    return [
      { code: 'ar', name: 'العربية', direction: 'rtl' },
      { code: 'en', name: 'English', direction: 'ltr' }
    ];
  }

  translate(key: string): string {
    const translation = this.translations[key];
    if (!translation) {
      console.warn(`Translation missing for key: ${key}`);
      return key;
    }

    const currentLang = this.getCurrentLanguage();
    return translation[currentLang as 'ar' | 'en'] || translation.ar || key;
  }

  translateObservable(key: string): Observable<string> {
    return new Observable(observer => {
      const subscription = this.currentLanguage$.subscribe(() => {
        observer.next(this.translate(key));
      });
      
      return () => subscription.unsubscribe();
    });
  }

  isRTL(): boolean {
    return this.getCurrentLanguage() === 'ar';
  }

  toggleLanguage(): void {
    const currentLang = this.getCurrentLanguage();
    const newLang = currentLang === 'ar' ? 'en' : 'ar';
    this.setLanguage(newLang);
  }
}