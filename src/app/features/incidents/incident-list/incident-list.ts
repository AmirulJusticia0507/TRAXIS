import type { TemplateRef } from '@angular/core';
import { Component, DestroyRef, inject, signal, ViewChild } from '@angular/core';
import { RouterLink } from '@angular/router';
import { finalize } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

import type { Paginated, SortOrder } from '../../../core/models/api.types';
import type { Incident } from '../../../core/models/incident.model';
import { ApiService } from '../../../core/services/api.service';
import { DataTable, TableColumn } from '../../../shared/components/data-table/data-table';
import { ErrorState } from '../../../shared/components/error-state/error-state';
import { PageHeader } from '../../../shared/components/page-header/page-header';
import { Paginator } from '../../../shared/components/paginator/paginator';
import { StatusBadge } from '../../../shared/components/status-badge/status-badge';
import { formatDateTime } from '../../../shared/utils/format';

@Component({
  selector: 'app-incident-list',
  imports: [RouterLink, DataTable, ErrorState, PageHeader, Paginator, StatusBadge],
  templateUrl: './incident-list.html',
  styleUrl: './incident-list.scss'
})
export class IncidentList {
  private readonly api = inject(ApiService);
  private readonly destroyRef = inject(DestroyRef);

  protected readonly page = signal(1);
  protected readonly limit = signal(20);
  protected readonly sortKey = signal<string>('reported_at');
  protected readonly sortOrder = signal<SortOrder>('desc');

  protected readonly data = signal<Incident[]>([]);
  protected readonly meta = signal<{ page: number; totalPages: number; totalItems: number } | null>(
    null
  );
  protected readonly loading = signal(false);
  protected readonly error = signal<string | null>(null);

  protected readonly columns: TableColumn<Incident>[] = [
    { key: 'id', header: 'ID', sortable: true },
    { key: 'line_type', header: 'Line', sortable: true },
    { key: 'location_station', header: 'Lokasi Stasiun', sortable: true },
    {
      key: 'delay_duration_minutes',
      header: 'Durasi (menit)',
      align: 'right',
      sortable: true,
      render: (i) => `${i.delayDurationMinutes}`
    },
    {
      key: 'reported_at',
      header: 'Dilaporkan',
      sortable: true,
      render: (i) => formatDateTime(i.reportedAt)
    },
    { key: 'status', header: 'Status', align: 'center', sortable: true }
  ];

  constructor() {
    this.load();
  }

  protected load(): void {
    this.loading.set(true);
    this.error.set(null);

    this.api
      .getIncidents({
        page: this.page(),
        limit: this.limit(),
        sort: this.sortKey(),
        order: this.sortOrder()
      })
      .pipe(takeUntilDestroyed(this.destroyRef), finalize(() => this.loading.set(false)))
      .subscribe({
        next: (result: Paginated<Incident>) => {
          this.data.set(result.data);
          this.meta.set(result.meta);
        },
        error: () => this.error.set('Gagal memuat data insiden.')
      });
  }

  protected onSortChange(sort: { key: string; order: SortOrder }): void {
    this.sortKey.set(sort.key);
    this.sortOrder.set(sort.order);
    this.page.set(1);
    this.load();
  }

  protected onPageChange(page: number): void {
    this.page.set(page);
    this.load();
  }

  protected onResolve(incident: Incident): void {
    this.api
      .updateIncidentStatus(incident.id, { status: 'RESOLVED' })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => this.load(),
        error: () => this.error.set('Gagal menyelesaikan insiden.')
      });
  }

  protected retry(): void {
    this.load();
  }

  @ViewChild('statusCell')
  protected set statusCellTemplate(template: TemplateRef<{ $implicit: Incident }> | undefined) {
    if (template) {
      const column = this.columns.find((c) => c.key === 'status');
      if (column) column.cellTemplate = template;
    }
  }

  @ViewChild('actionsCell')
  protected set actionsCellTemplate(template: TemplateRef<{ $implicit: Incident }> | undefined) {
    if (template) {
      this.columns.push({
        key: 'actions',
        header: 'Aksi',
        align: 'center',
        cellTemplate: template
      });
    }
  }
}
