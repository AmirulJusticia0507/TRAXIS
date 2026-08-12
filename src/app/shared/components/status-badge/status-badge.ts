import { Component, input } from '@angular/core';

export type StatusTone = 'success' | 'warning' | 'danger' | 'info';

const STATUS_TONE: Record<string, StatusTone> = {
  ACTIVE: 'success',
  ON_TIME: 'success',
  RESOLVED: 'success',
  COMPLETED: 'info',
  AT_STATION: 'success',
  IN_TRANSIT: 'info',
  DELAYED: 'warning',
  MAINTENANCE: 'warning',
  IN_PROGRESS: 'warning',
  CANCELLED: 'danger',
  OPEN: 'danger',
  OUT_OF_SERVICE: 'danger'
};

@Component({
  selector: 'app-status-badge',
  imports: [],
  templateUrl: './status-badge.html',
  styleUrl: './status-badge.scss'
})
export class StatusBadge {
  readonly status = input.required<string>();

  protected readonly tone = (): StatusTone => STATUS_TONE[this.status()] ?? 'info';

  protected readonly label = (): string => {
    const raw = this.status().replaceAll('_', ' ').toLowerCase();
    return raw.charAt(0).toUpperCase() + raw.slice(1);
  };
}
