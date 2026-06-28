import {
  ApplicationConfig,
  provideBrowserGlobalErrorListeners,
  provideAppInitializer
} from '@angular/core';

import {
  provideHttpClient,
  withInterceptors
} from '@angular/common/http';

import { provideRouter } from '@angular/router';

import { routes } from './app.routes';
import { credentialsInterceptor } from './interceptors/credentials.interceptor';
import { authInitializer } from './initializers/auth.initializer';


export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideRouter(routes),
    provideHttpClient(
      withInterceptors([credentialsInterceptor])
    ),
    provideAppInitializer(authInitializer)
  ]
};