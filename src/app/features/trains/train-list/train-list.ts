import type { TemplateRef } from '@angular/core';
import { Component, DestroyRef, inject, signal, ViewChild } from '@angular/core';
import { RouterLink } from '@angular/router';
import { finalize } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

import type { Paginated, SortOrder, TrainStatus } from '../../../core/models/api.types';
import type { Train } from '../../../core/models/train.model';
import { ApiService } from '../../../core/services/api.service';
import { DataTable, TableColumn } from '../../../shared/components/data-table/data-table';
import { ErrorState } from '../../../shared/components/error-state/error-state';
import { PageHeader } from '../../../shared/components/page-header/page-header';
import { Paginator } from '../../../shared/components/paginator/paginator';
import { StatusBadge } from '../../../shared/components/status-badge/status-badge';

const TRAIN_STATUSES: TrainStatus[] = ['ACTIVE', 'MAINTENANCE', 'DELAYED'];

@Component({
  selector: 'app-train-list',
  imports: [
    RouterLink,
    DataTable,
    ErrorState,
    PageHeader,
    Paginator,
    StatusBadge
  ],
  templateUrl: './train-list.html',
  styleUrl: './train-list.scss'
})
export class TrainList {
  private readonly api = inject(ApiService);
  private readonly destroyRef = inject(DestroyRef);

  protected readonly page = signal(1);
  protected readonly limit = signal(20);
  protected readonly sortKey = signal<string>('train_code');
  protected readonly sortOrder = signal<SortOrder>('asc');

  protected readonly data = signal<Train[]>([]);
  protected readonly meta = signal<{ page: number; totalPages: number; totalItems: number } | null>(
    null
  );
  protected readonly loading = signal(false);
  protected readonly error = signal<string | null>(null);
  protected readonly statusOptions = TRAIN_STATUSES;

  protected readonly columns: TableColumn<Train>[] = [
    { key: 'train_code', header: 'Kode Kereta', sortable: true },
    { key: 'line_name', header: 'Jalur / Line', sortable: true },
    {
      key: 'capacity',
      header: 'Kapasitas',
      align: 'right',
      sortable: true,
      render: (t) => t.capacity.toLocaleString('id-ID')
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
      .getTrains({
        page: this.page(),
        limit: this.limit(),
        sort: this.sortKey(),
        order: this.sortOrder()
      })
      .pipe(takeUntilDestroyed(this.destroyRef), finalize(() => this.loading.set(false)))
      .subscribe({
        next: (result: Paginated<Train>) => {
          this.data.set(result.data);
          this.meta.set(result.meta);
        },
        error: () => this.error.set('Gagal memuat data armada kereta.')
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

  protected onDelete(train: Train): void {
    if (!window.confirm(`Hapus armada ${train.trainCode}?`)) return;
    this.api
      .deleteTrain(train.id)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => this.load(),
        error: () => this.error.set('Gagal menghapus armada.')
      });
  }

  protected retry(): void {
    this.load();
  }

  @ViewChild('statusCell')
  protected set statusCellTemplate(template: TemplateRef<{ $implicit: Train }> | undefined) {
    if (template) {
      const column = this.columns.find((c) => c.key === 'status');
      if (column) column.cellTemplate = template;
    }
  }

  @ViewChild('actionsCell')
  protected set actionsCellTemplate(template: TemplateRef<{ $implicit: Train }> | undefined) {
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
