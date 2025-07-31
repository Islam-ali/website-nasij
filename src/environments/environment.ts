// This is the base environment configuration.
// The actual environment used will be determined by the build configuration in angular.json
// and the appropriate environment file will be used based on the build target.

// Import the development environment as the default
import { environment as devEnvironment } from './environment.development';

// Export the appropriate environment based on the build configuration
// This ensures that the app always has a valid environment configuration
export const environment = devEnvironment;

/*
 * For easier debugging in development mode, you can import the following file
 * to ignore zone related error stack frames such as `zone.run`, `zoneDelegate.invokeTask`.
 *
 * This import should be commented out in production mode because it will have a negative impact
 * on performance if an error is thrown.
 */
// import 'zone.js/plugins/zone-error';  // Included with Angular CLI.
