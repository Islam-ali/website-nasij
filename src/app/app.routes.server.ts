import { RenderMode, ServerRoute } from '@angular/ssr';

// app.routes.server.ts
export const serverRoutes: ServerRoute[] = [
  // Use Server mode for all routes to ensure SSR works
  { path: '', renderMode: RenderMode.Server },
  { path: 'shop', renderMode: RenderMode.Server },
  { path: 'about', renderMode: RenderMode.Server },
  { path: 'cart', renderMode: RenderMode.Server },
  { path: 'wishlist', renderMode: RenderMode.Server },
  { path: 'privacy-policy', renderMode: RenderMode.Server },
  { path: 'terms-of-service', renderMode: RenderMode.Server },
  { path: 'faq', renderMode: RenderMode.Server },
  { path: '404', renderMode: RenderMode.Server },

  // Dynamic or authenticated → Server (SSR on-demand)
  { path: 'shop/:id/:slug', renderMode: RenderMode.Server },
  { path: 'packages', renderMode: RenderMode.Server },
  { path: 'packages/:id', renderMode: RenderMode.Server },
  { path: 'orders', renderMode: RenderMode.Server },
  { path: 'orders/:id', renderMode: RenderMode.Server },
  { path: 'profile', renderMode: RenderMode.Server },
  { path: 'checkout', renderMode: RenderMode.Server },
  { path: 'auth', renderMode: RenderMode.Server },
  { path: 'auth/login', renderMode: RenderMode.Server },
  { path: 'auth/register', renderMode: RenderMode.Server },

  // Catch-all for everything else
  { path: '**', renderMode: RenderMode.Server }
];