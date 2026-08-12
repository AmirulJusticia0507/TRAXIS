import type { CanActivateFn } from '@angular/router';
import { inject } from '@angular/core';

import { LoggerService } from '../services/logger.service';

const AUTH_TOKEN_KEY = 'traxis_token';

/**
 * authGuard - contoh guard route. Hanya mengizinkan akses bila token JWT
 * tersedia. Terapkan pada route yang memerlukan autentikasi.
 */
export const authGuard: CanActivateFn = () => {
  const logger = inject(LoggerService);
  const hasToken = typeof localStorage !== 'undefined' && !!localStorage.getItem(AUTH_TOKEN_KEY);

  if (!hasToken) {
    logger.warn('authGuard: akses ditolak - token tidak ditemukan');
    return false;
  }

  return true;
};
