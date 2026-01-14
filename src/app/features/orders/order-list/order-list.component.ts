import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { UiButtonComponent, UiCardComponent, UiChipComponent, UiSpinnerComponent } from '../../../shared/ui';
import { OrderStatus } from '../../../interfaces/product.interface';

interface Order {
  id: string;
  date: Date;
  total: number;
  status: OrderStatus;
  items: Array<{
    name: string;
    quantity: number;
    price: number;
  }>;
}

@Component({
  selector: 'app-order-list',
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
      <ui-card>
        <div class="mb-6">
          <h2 class="text-2xl font-bold">My Orders</h2>
        </div>
        @if (loading) {
          <ui-spinner></ui-spinner>
        } @else {
          @if (orders.length === 0) {
            <div class="text-center py-12">
              <p class="text-gray-500">No orders found.</p>
            </div>
          } @else {
            <div class="overflow-x-auto">
              <table class="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                <thead class="bg-gray-50 dark:bg-gray-800">
                  <tr>
                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Order ID</th>
                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Date</th>
                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Items</th>
                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Total</th>
                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Status</th>
                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody class="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-700">
                  @for (order of orders; track order.id) {
                    <tr>
                      <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">{{order.id}}</td>
                      <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">{{order.date | date:'mediumDate'}}</td>
                      <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">{{order.items.length}} item(s)</td>
                      <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">{{order.total | currency:'USD'}}</td>
                      <td class="px-6 py-4 whitespace-nowrap text-sm">
                        <ui-chip [variant]="getSeverity(order.status)">{{order.status}}</ui-chip>
                      </td>
                      <td class="px-6 py-4 whitespace-nowrap text-sm">
                        <ui-button variant="ghost" size="sm" [routerLink]="['/orders', order.id]">
                          <i class="pi pi-eye me-1"></i>
                          View
                        </ui-button>
                      </td>
                    </tr>
                  }
                </tbody>
              </table>
            </div>
          }
        }
      </ui-card>
    </div>
  `,
  styles: [`
    .order-actions {
      display: flex;
      gap: 0.5rem;
    }
  `]
})
export class OrderListComponent implements OnInit {
  orders: Order[] = [];
  loading = true;

  ngOnInit() {
    // TODO: Load orders from service
    setTimeout(() => {
      this.orders = this.getMockOrders();
      this.loading = false;
    }, 1000);
  }

  getSeverity(status: OrderStatus): "primary" | "warning" | "success" | "default" | "danger" {
    switch (status) {
      case OrderStatus.DELIVERED:
        return 'success';
      case OrderStatus.PENDING:
        return 'warning';
      case OrderStatus.CANCELLED:
        return 'danger';
      case OrderStatus.POSTPONED:
        return 'warning';
      case OrderStatus.RETURNED:
        return 'danger';
      default:
        return 'default';
    }
  }

  private getMockOrders(): Order[] {
    return [
      {
        id: 'ORD-001',
        date: new Date(2023, 5, 15),
        total: 199.99,
        status: OrderStatus.DELIVERED,
        items: [
          { name: 'Product 1', quantity: 2, price: 99.99 }
        ]
      },
      {
        id: 'ORD-002',
        date: new Date(2023, 5, 10),
        total: 149.99,
        status: OrderStatus.PENDING,
        items: [
          { name: 'Product 2', quantity: 1, price: 149.99 }
        ]
      }
    ];
  }
}
