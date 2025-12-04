import { bootstrapApplication, BootstrapContext } from '@angular/platform-browser';
import { AppComponent } from './app/app.component';
import { config } from './app/app.config.server';

// Allow self-signed certificates during local SSR development.
// This prevents Node.js fetch calls (used by Angular SSR) from failing with
// DEPTH_ZERO_SELF_SIGNED_CERT when hitting https://localhost endpoints.
if (process.env['NODE_ENV'] !== 'production') {
  process.env['NODE_TLS_REJECT_UNAUTHORIZED'] = '0';
}

const bootstrap = (context: BootstrapContext) => bootstrapApplication(AppComponent, config, context);

export default bootstrap;
