import { Injectable } from '@angular/core';

/**
 * LoggerService - logger internal aplikasi (GUIDELINES.md: Console Hygiene).
 * Gunakan ini, bukan console.log langsung, agar mudah dipotong saat build prod.
 */
@Injectable({ providedIn: 'root' })
export class LoggerService {
  private readonly prefix = '[TRAXIS]';

  info(message: string, ...data: unknown[]): void {
    console.info(this.prefix, message, ...data);
  }

  warn(message: string, ...data: unknown[]): void {
    console.warn(this.prefix, message, ...data);
  }

  error(message: string, ...data: unknown[]): void {
    console.error(this.prefix, message, ...data);
  }

  debug(message: string, ...data: unknown[]): void {
    console.debug(this.prefix, message, ...data);
  }
}
