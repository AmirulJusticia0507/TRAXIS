import { Component, DestroyRef, inject, signal } from '@angular/core';
import { interval, switchMap } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

import type { TrainPosition } from '../../../core/models/position.model';
import { ApiService } from '../../../core/services/api.service';
import { ErrorState } from '../../../shared/components/error-state/error-state';
import { PageHeader } from '../../../shared/components/page-header/page-header';
import { SkeletonLoader } from '../../../shared/components/skeleton-loader/skeleton-loader';
import { StatusBadge } from '../../../shared/components/status-badge/status-badge';
import { formatDateTime, formatTime } from '../../../shared/utils/format';

/**
 * Dashboard telemetri real-time. Polling tiap 2 detik
 * (target latency < 2 detik - GOALS.md).
 */
@Component({
  selector: 'app-live-tracking',
  imports: [ErrorState, PageHeader, SkeletonLoader, StatusBadge],
  templateUrl: './live-tracking.html',
  styleUrl: './live-tracking.scss'
})
export class LiveTracking {
  private readonly api = inject(ApiService);
  private readonly destroyRef = inject(DestroyRef);

  protected readonly positions = signal<TrainPosition[]>([]);
  protected readonly loading = signal(true);
  protected readonly error = signal<string | null>(null);
  protected readonly lastUpdated = signal<string | null>(null);

  constructor() {
    this.poll();
  }

  private poll(): void {
    interval(2000)
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        switchMap(() => this.api.getLivePositions())
      )
      .subscribe({
        next: (positions) => {
          this.positions.set(positions);
          this.loading.set(false);
          this.error.set(null);
          this.lastUpdated.set(positions[0]?.lastUpdatedAt ?? null);
        },
        error: () => {
          this.loading.set(false);
          this.error.set('Gagal menerima data telemetri kereta.');
        }
      });
  }

  protected readonly inTransitCount = (): number =>
    this.positions().filter((p) => p.status === 'IN_TRANSIT').length;

  protected readonly atStationCount = (): number =>
    this.positions().filter((p) => p.status === 'AT_STATION').length;

  protected readonly formatUpdatedAt = (iso: string | null): string =>
    iso ? formatDateTime(iso) : '-';

  protected readonly formatTime = formatTime;

  protected readonly formatSpeed = (speed: number): string => `${speed.toFixed(1)} km/jam`;

  protected retry(): void {
    this.loading.set(true);
    this.error.set(null);
    this.poll();
  }
}
