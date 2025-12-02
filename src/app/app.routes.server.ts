import { RenderMode, ServerRoute } from '@angular/ssr';

// app.routes.server.ts
export const serverRoutes: ServerRoute[] = [
  // Safe static/public routes only
  { path: '', renderMode: RenderMode.Prerender },
  { path: 'shop', renderMode: RenderMode.Prerender },
  { path: 'about', renderMode: RenderMode.Prerender },
  { path: 'cart', renderMode: RenderMode.Prerender },        // OK if cart is in memory only
  { path: 'wishlist', renderMode: RenderMode.Prerender },    // same
  { path: 'privacy-policy', renderMode: RenderMode.Prerender },
  { path: 'terms-of-service', renderMode: RenderMode.Prerender },
  { path: 'faq', renderMode: RenderMode.Prerender },
  { path: '404', renderMode: RenderMode.Prerender },

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