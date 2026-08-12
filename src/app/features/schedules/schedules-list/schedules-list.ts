import type { TemplateRef } from '@angular/core';
import { Component, DestroyRef, inject, signal, ViewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Subject, debounceTime, finalize } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

import type { Paginated, ScheduleStatus, SortOrder } from '../../../core/models/api.types';
import type { Schedule } from '../../../core/models/schedule.model';
import type { Line } from '../../../core/models/line.model';
import { ApiService } from '../../../core/services/api.service';
import { DataTable, TableColumn } from '../../../shared/components/data-table/data-table';
import { ErrorState } from '../../../shared/components/error-state/error-state';
import { PageHeader } from '../../../shared/components/page-header/page-header';
import { Paginator } from '../../../shared/components/paginator/paginator';
import { StatusBadge } from '../../../shared/components/status-badge/status-badge';
import { formatTime } from '../../../shared/utils/format';

const SCHEDULE_STATUSES: ScheduleStatus[] = ['ON_TIME', 'DELAYED', 'CANCELLED', 'COMPLETED'];

@Component({
  selector: 'app-schedules-list',
  imports: [
    FormsModule,
    DataTable,
    ErrorState,
    PageHeader,
    Paginator,
    StatusBadge
  ],
  templateUrl: './schedules-list.html',
  styleUrl: './schedules-list.scss'
})
export class SchedulesList {
  private readonly api = inject(ApiService);
  private readonly destroyRef = inject(DestroyRef);
  private readonly search$ = new Subject<string>();

  protected readonly page = signal(1);
  protected readonly limit = signal(20);
  protected readonly sortKey = signal<string>('departure_time');
  protected readonly sortOrder = signal<SortOrder>('asc');
  protected readonly lineFilter = signal<string>('');
  protected readonly statusFilter = signal<string>('');
  protected readonly searchTerm = signal('');

  protected readonly lines = signal<Line[]>([]);
  protected readonly data = signal<Schedule[]>([]);
  protected readonly meta = signal<{ page: number; totalPages: number; totalItems: number } | null>(
    null
  );
  protected readonly loading = signal(false);
  protected readonly error = signal<string | null>(null);
  protected readonly statusOptions = SCHEDULE_STATUSES;

  protected readonly columns: TableColumn<Schedule>[] = [
    { key: 'train_code', header: 'Kode Kereta', sortable: true },
    { key: 'line_name', header: 'Jalur / Line', sortable: true },
    { key: 'origin_station', header: 'Stasiun Asal', sortable: true },
    { key: 'destination_station', header: 'Stasiun Tujuan', sortable: true },
    {
      key: 'departure_time',
      header: 'Jam Berangkat',
      align: 'center',
      sortable: true,
      render: (s) => formatTime(s.departureTime)
    },
    { key: 'status', header: 'Status Operasional', align: 'center', sortable: true }
  ];

  constructor() {
    this.search$
      .pipe(debounceTime(300), takeUntilDestroyed(this.destroyRef))
      .subscribe((term) => {
        this.searchTerm.set(term);
        this.page.set(1);
        this.load();
      });

    this.api.getLines().pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: (lines) => this.lines.set(lines),
      error: () => this.lines.set([])
    });

    this.load();
  }

  protected load(): void {
    this.loading.set(true);
    this.error.set(null);

    this.api
      .getSchedules({
        page: this.page(),
        limit: this.limit(),
        sort: this.sortKey(),
        order: this.sortOrder(),
        line: this.lineFilter() || undefined,
        status: (this.statusFilter() || undefined) as ScheduleStatus | undefined,
        q: this.searchTerm() || undefined
      })
      .pipe(takeUntilDestroyed(this.destroyRef), finalize(() => this.loading.set(false)))
      .subscribe({
        next: (result: Paginated<Schedule>) => {
          this.data.set(result.data);
          this.meta.set(result.meta);
        },
        error: () => {
          this.error.set('Gagal memuat data jadwal. Pastikan koneksi ke server berjalan.');
        }
      });
  }

  protected onSearchInput(event: Event): void {
    this.search$.next((event.target as HTMLInputElement).value);
  }

  protected onLineChange(event: Event): void {
    this.lineFilter.set((event.target as HTMLSelectElement).value);
    this.page.set(1);
    this.load();
  }

  protected onStatusChange(event: Event): void {
    this.statusFilter.set((event.target as HTMLSelectElement).value);
    this.page.set(1);
    this.load();
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

  protected retry(): void {
    this.load();
  }

  @ViewChild('statusCell')
  protected set statusCellTemplate(template: TemplateRef<{ $implicit: Schedule }> | undefined) {
    if (template) {
      const column = this.columns.find((c) => c.key === 'status');
      if (column) column.cellTemplate = template;
    }
  }
}
