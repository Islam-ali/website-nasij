import { Routes } from '@angular/router';
import { LayoutComponent } from './layout/layout.component';
import { authGuard } from './core/guards/auth.guard';
import { ErrorComponent } from './core/components/error/error.component';
import { NotFoundComponent } from './core/components/not-found/not-found.component';

export const routes: Routes = [
  {
    path: '',
    component: LayoutComponent,
    children: [
      // Public routes
      {
        path: '',
        loadComponent: () => import('./features/home/home.component').then(m => m.HomeComponent),
        title: 'Home',
        data: { breadcrumb: 'Home' }
      },
      {
        path: 'shop',
        loadComponent: () => import('./features/products/product-list/product-list.component')
          .then(m => m.ProductListComponent)
          .catch(() => ErrorComponent),
        title: 'shop',
        data: { breadcrumb: 'shop' }
      },
      {
        path: 'about',
        loadComponent: () => import('./features/about/about.component')
          .then(m => m.AboutComponent)
          .catch(() => ErrorComponent),
        title: 'About',
        data: { breadcrumb: 'About' }
      },
      {
        path: 'shop/:id/:slug',
        loadComponent: () => import('./features/products/product-details/product-details.component')
          .then(m => m.ProductDetailsComponent)
          .catch(() => ErrorComponent),
        data: { breadcrumb: 'Product Details' }
      },
      {
        path: 'packages',
        loadComponent: () => import('./features/packages/packages.component')
          .then(m => m.PackagesComponent)
          .catch(() => ErrorComponent),
        title: 'Packages',
        data: { breadcrumb: 'Packages' }
      },
      {
        path: 'track-order',
        loadComponent: () => import('./features/orders/order-tracking/order-tracking.component')
          .then(m => m.OrderTrackingComponent)
          .catch(() => ErrorComponent),
        title: 'Track Order',
        data: { breadcrumb: 'Track Order' }
      },
      {
        path: 'packages/:id',
        loadComponent: () => import('./features/packages/package-details/package-details.component')
          .then(m => m.PackageDetailsComponent)
          .catch(() => ErrorComponent),
        data: { breadcrumb: 'Package Details' }
      },
      {
        path: 'cart',
        loadComponent: () => import('./features/cart/cart.component')
          .then(m => m.CartComponent)
          .catch(() => ErrorComponent),
        title: 'Shopping Cart',
        data: { breadcrumb: 'Cart' }
      },
      {
        path: 'wishlist',
        loadComponent: () => import('./features/wishlist/wishlist.component')
          .then(m => m.WishlistComponent)
          .catch(() => ErrorComponent),
        title: 'Wishlist',
        data: { breadcrumb: 'Wishlist' }
      },
      {
        path: 'privacy-policy',
        loadComponent: () => import('./features/business-profile/privacy-policy/privacy-policy.component')
          .then(m => m.PrivacyPolicyComponent)
          .catch(() => ErrorComponent),
        title: 'Privacy Policy',
        data: { breadcrumb: 'Privacy Policy' }
      },
      {
        path: 'terms-of-service',
        loadComponent: () => import('./features/business-profile/terms-of-service/terms-of-service.component')
          .then(m => m.TermsOfServiceComponent)
          .catch(() => ErrorComponent),
        title: 'Terms of Service',
        data: { breadcrumb: 'Terms of Service' }
      },
      {
        path: 'faq',
        loadComponent: () => import('./features/business-profile/faq/faq.component')
          .then(m => m.FaqComponent)
          .catch(() => ErrorComponent),
        title: 'FAQ',
        data: { breadcrumb: 'FAQ' }
      },      
      // Protected routes
      {
        path: 'checkout',
        loadComponent: () => import('./features/checkout/checkout.component')
          .then(m => m.CheckoutComponent)
          .catch(() => ErrorComponent),
        title: 'Checkout',
        data: { breadcrumb: 'Checkout' }
      },
      {
        path: 'profile',
        loadComponent: () => import('./features/profile/profile.component')
          .then(m => m.ProfileComponent)
          .catch(() => ErrorComponent),
        canActivate: [authGuard],
        title: 'My Profile',
        data: { breadcrumb: 'My Profile' }
      },
      {
        path: 'orders',
        loadComponent: () => import('./features/orders/order-list/order-list.component')
          .then(m => m.OrderListComponent)
          .catch(() => ErrorComponent),
        canActivate: [authGuard],
        title: 'My Orders',
        data: { breadcrumb: 'My Orders' }
      },
      {
        path: 'orders/:id',
        loadComponent: () => import('./features/orders/order-details/order-details.component')
          .then(m => m.OrderDetailsComponent)
          .catch(() => ErrorComponent),
        canActivate: [authGuard],
        data: { breadcrumb: 'Order Details' }
      },
      // Auth routes (login, register, etc.)
      {
        path: 'auth',
        loadChildren: () => import('./features/auth/auth.routes')
          .then(m => m.AUTH_ROUTES)
          .catch(() => [])
      },
      
      // 404 Not Found
      {
        path: '404',
        loadComponent: () => Promise.resolve(NotFoundComponent),
        title: 'Page Not Found',
        data: { breadcrumb: 'Not Found' }
      },
      
      // Redirect all unknown paths to 404
      {
        path: '**',
        redirectTo: '404',
        pathMatch: 'full'
      }
    ]
  }
];
