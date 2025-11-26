import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { UiButtonComponent, UiCardComponent, UiChipComponent, UiSpinnerComponent } from '../../../shared/ui';
import { OrderStatus } from '../../../interfaces/product.interface';

interface OrderItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  image?: string;
}

interface Order {
  id: string;
  date: Date;
  status: OrderStatus;
  items: OrderItem[];
  subtotal: number;
  shipping: number;
  tax: number;
  total: number;
  shippingAddress: {
    name: string;
    address: string;
    city: string;
    state: string;
    zip: string;
    country: string;
  };
  paymentMethod: string;
}

@Component({
  selector: 'app-order-details',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    UiButtonComponent,
    UiCardComponent,
    UiChipComponent,
    UiSpinnerComponent
  ],
  template: `
    <div class="p-4">
      <div class="mb-4">
        <ui-button variant="ghost" size="md" routerLink="/orders">
          <i class="pi pi-arrow-left mr-2"></i>
          Back to Orders
        </ui-button>
      </div>

      <ui-card>
        <div class="mb-6">
          <h2 class="text-2xl font-bold">Order #{{order?.id || ''}}</h2>
          <p class="text-gray-500 mt-1">Order Details</p>
        </div>
        <div class="grid">
          <div class="col-12 md:col-8">
            <h4 class="text-lg font-semibold mb-4">Order Items</h4>
            @if (loading) {
              <ui-spinner></ui-spinner>
            } @else {
              <div class="overflow-x-auto">
                <table class="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                  <thead class="bg-gray-50 dark:bg-gray-800">
                    <tr>
                      <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Product</th>
                      <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Price</th>
                      <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Quantity</th>
                      <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Total</th>
                    </tr>
                  </thead>
                  <tbody class="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-700">
                    @for (item of order?.items || []; track item.id) {
                      <tr>
                        <td class="px-6 py-4 whitespace-nowrap">
                          <div class="flex items-center gap-2">
                            <img [src]="item.image || 'assets/images/placeholder.png'" 
                                [alt]="item.name" 
                                class="w-12 h-12 object-cover rounded"/>
                            <span class="text-sm text-gray-900 dark:text-white">{{item.name}}</span>
                          </div>
                        </td>
                        <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">{{item.price | currency:'USD'}}</td>
                        <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">{{item.quantity}}</td>
                        <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">{{item.price * item.quantity | currency:'USD'}}</td>
                      </tr>
                    }
                  </tbody>
                </table>
              </div>
            }

            <div class="mt-4">
              <h4>Order Summary</h4>
              <div class="grid">
                <div class="col-6">
                  <p>Subtotal</p>
                  <p>Shipping</p>
                  <p>Tax</p>
                  <p class="font-bold">Total</p>
                </div>
                <div class="col-6 text-right">
                  <p>{{order?.subtotal | currency:'USD'}}</p>
                  <p>{{order?.shipping | currency:'USD'}}</p>
                  <p>{{order?.tax | currency:'USD'}}</p>
                  <p class="font-bold">{{order?.total | currency:'USD'}}</p>
                </div>
              </div>
            </div>
          </div>

          <div class="col-12 md:col-4">
            <div class="mb-4">
              <h4>Shipping Address</h4>
              <p *ngIf="order?.shippingAddress">
                {{order?.shippingAddress?.name}}<br>
                {{order?.shippingAddress?.address}}<br>
                {{order?.shippingAddress?.city}}, {{order?.shippingAddress?.state}} {{order?.shippingAddress?.zip}}<br>
                {{order?.shippingAddress?.country}}
              </p>
            </div>

            <div>
              <h4>Payment Method</h4>
              <p>{{order?.paymentMethod || 'Credit Card'}}</p>
            </div>

            <div class="mt-4" *ngIf="order?.status === OrderStatus.PENDING">
              <ui-button variant="destructive" size="md" (click)="cancelOrder()">
                Cancel Order
              </ui-button>
            </div>
          </div>
        </div>
      </ui-card>
    </div>
  `
})
export class OrderDetailsComponent implements OnInit {
  order: Order | null = null;
  loading = true;
  orderId: string | null = null;
  OrderStatus = OrderStatus;
  constructor(private route: ActivatedRoute) {}

  ngOnInit() {
    this.orderId = this.route.snapshot.paramMap.get('id');
    this.loadOrder();
  }

  loadOrder() {
    // TODO: Load order details from service
    setTimeout(() => {
      this.order = this.getMockOrder(this.orderId || '1');
      this.loading = false;
    }, 1000);
  }

  cancelOrder() {
    // TODO: Implement order cancellation
    if (this.order) {
      this.order.status = OrderStatus.CANCELLED;
    }
  }

  private getMockOrder(id: string): Order {
    return {
      id: id,
      date: new Date(2023, 5, 15),
      status: OrderStatus.PENDING,
      subtotal: 199.98,
      shipping: 15.00,
      tax: 17.10,
      total: 232.08,
      paymentMethod: 'Visa ending in 4242',
      shippingAddress: {
        name: 'John Doe',
        address: '123 Main St',
        city: 'New York',
        state: 'NY',
        zip: '10001',
        country: 'United States'
      },
      items: [
        {
          id: '1',
          name: 'Premium Headphones',
          price: 199.98,
          quantity: 1,
          image: 'assets/images/headphones.jpg'
        }
      ]
    };
  }
}
