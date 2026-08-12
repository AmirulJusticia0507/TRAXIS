import type { HttpEvent, HttpHandlerFn, HttpInterceptorFn, HttpRequest } from '@angular/common/http';
import { HttpEventType } from '@angular/common/http';
import { inject } from '@angular/core';
import { tap } from 'rxjs';

import { LoggerService } from '../services/logger.service';

/**
 * HttpInterceptor logging (README.md: Debugging & Logging Strategy).
 * Memotong semua REST request/response untuk logging kesalahan network/server.
 */
export const httpLoggingInterceptor: HttpInterceptorFn = (
  req: HttpRequest<unknown>,
  next: HttpHandlerFn
) => {
  const logger = inject(LoggerService);

  logger.debug(`-> ${req.method} ${req.urlWithParams}`);

  return next(req).pipe(
    tap({
      next: (event: HttpEvent<unknown>) => {
        if (event.type === HttpEventType.Response) {
          logger.debug(`<- ${req.method} ${req.urlWithParams} ${event.status}`);
        }
      },
      error: (error: unknown) => {
        logger.error(`x ${req.method} ${req.urlWithParams}`, error);
      }
    })
  );
};
