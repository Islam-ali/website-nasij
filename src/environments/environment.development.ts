// This file is used for development environment
// It will be used when running the app with `ng serve` or `ng build --configuration=development`

export const environment = {
  production: false,
  domain: 'http://localhost:3000',
  apiUrl: 'http://localhost:3000/api/v1',// Development API URL
  appName: 'Online Store (Dev)',
  appVersion: '1.0.0-dev',
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
