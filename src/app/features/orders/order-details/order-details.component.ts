import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { TableModule } from 'primeng/table';
import { TagModule } from 'primeng/tag';
import { OrderStatus } from '../../../interfaces/order.interface';

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
    CardModule,
    ButtonModule,
    TableModule,
    TagModule
  ],
  template: `
    <div class="p-4">
      <div class="mb-4">
        <button pButton pRipple 
                icon="pi pi-arrow-left" 
                label="Back to Orders" 
                class="p-button-text"
                routerLink="/orders">
        </button>
      </div>

      <p-card [header]="'Order #' + (order?.id || '')" subheader="Order Details">
        <div class="grid">
          <div class="col-12 md:col-8">
            <h4>Order Items</h4>
            <p-table [value]="order?.items || []" [showCurrentPageReport]="true" 
                    [rowsPerPageOptions]="[5,10,25,50]" [paginator]="true" 
                    currentPageReportTemplate="Showing {first} to {last} of {totalRecords} entries">
              <ng-template pTemplate="header">
                <tr>
                  <th>Product</th>
                  <th>Price</th>
                  <th>Quantity</th>
                  <th>Total</th>
                </tr>
              </ng-template>
              <ng-template pTemplate="body" let-item>
                <tr>
                  <td>
                    <div class="flex align-items-center gap-2">
                      <img [src]="item.image || 'assets/images/placeholder.png'" 
                          [alt]="item.name" 
                          style="width: 50px; height: 50px; object-fit: cover;"/>
                      <span>{{item.name}}</span>
                    </div>
                  </td>
                  <td>{{item.price | currency:'USD'}}</td>
                  <td>{{item.quantity}}</td>
                  <td>{{item.price * item.quantity | currency:'USD'}}</td>
                </tr>
              </ng-template>
            </p-table>

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
              <button pButton 
                      label="Cancel Order" 
                      class="p-button-danger"
                      (click)="cancelOrder()">
              </button>
            </div>
          </div>
        </div>
      </p-card>
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
