import { ErrorHandler, Injectable, inject } from '@angular/core';

import { LoggerService } from '../services/logger.service';

/**
 * GlobalErrorHandler (README.md): menangkap error runtime Angular yang tidak
 * terduga dan meneruskannya ke dashboard monitor.
 */
@Injectable()
export class GlobalErrorHandler implements ErrorHandler {
  private readonly logger = inject(LoggerService);

  handleError(error: unknown): void {
    this.logger.error('Unhandled runtime error', error);
  }
}
