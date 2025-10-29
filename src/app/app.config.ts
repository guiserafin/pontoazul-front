import { provideHttpClient, withFetch, withInterceptors } from '@angular/common/http';
import { ApplicationConfig, provideBrowserGlobalErrorListeners, provideZoneChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';

import { environment } from '../environments/environment';
import { APP_ENVIRONMENT, API_BASE_URL, AppEnvironment } from './core/config/environment.tokens';
import { apiPrefixInterceptor } from './core/interceptors/api-prefix.interceptor';
import { httpErrorInterceptor } from './core/interceptors/http-error.interceptor';
import { routes } from './app.routes';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes),
    provideHttpClient(
      withFetch(),
      withInterceptors([apiPrefixInterceptor, httpErrorInterceptor])
    ),
    { provide: APP_ENVIRONMENT, useValue: environment },
    {
      provide: API_BASE_URL,
      deps: [APP_ENVIRONMENT],
      useFactory: (env: AppEnvironment) => env.apiUrl
    }
  ]
};
