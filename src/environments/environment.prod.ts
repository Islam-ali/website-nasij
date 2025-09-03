export const environment = {
  production: true,
  domain: 'https://pledge-backend-sigma.vercel.app',
  apiUrl: 'https://pledge-backend-sigma.vercel.app/api/v1', // Development API URL
  appName: 'Online Store (Dev)',
  appVersion: '1.0.0',
  stripePublishableKey: 'your-test-stripe-key',
  googleAnalyticsId: '', // Empty in development
  sentryDsn: '', // Empty in development
  features: {
    enableWishlist: true,
    enableReviews: true,
    enableCompare: true,
    enableDebug: true // Additional debug features can be enabled in development
  }
};
