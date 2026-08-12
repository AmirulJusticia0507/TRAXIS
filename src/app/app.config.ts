import { ApplicationConfig, ErrorHandler, provideBrowserGlobalErrorListeners } from '@angular/core';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { provideRouter } from '@angular/router';

import { routes } from './app.routes';
import { GlobalErrorHandler } from './core/errors/global-error-handler';
import { httpLoggingInterceptor } from './core/interceptors/http-logging.interceptor';
import { mockApiInterceptor } from './core/interceptors/mock-api.interceptor';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideRouter(routes),
    // Urutan interceptor: logging membungkus mock (respons mock tetap tercatat).
    provideHttpClient(withInterceptors([httpLoggingInterceptor, mockApiInterceptor])),
    { provide: ErrorHandler, useClass: GlobalErrorHandler }
  ]
};
