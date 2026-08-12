import { Component, DestroyRef, inject, signal } from '@angular/core';
import { finalize } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

import type { Line } from '../../../core/models/line.model';
import type { Station } from '../../../core/models/station.model';
import { ApiService } from '../../../core/services/api.service';
import { DataTable, TableColumn } from '../../../shared/components/data-table/data-table';
import { ErrorState } from '../../../shared/components/error-state/error-state';
import { PageHeader } from '../../../shared/components/page-header/page-header';

@Component({
  selector: 'app-stations-list',
  imports: [DataTable, ErrorState, PageHeader],
  templateUrl: './stations-list.html',
  styleUrl: './stations-list.scss'
})
export class StationsList {
  private readonly api = inject(ApiService);
  private readonly destroyRef = inject(DestroyRef);

  protected readonly lines = signal<Line[]>([]);
  protected readonly data = signal<Station[]>([]);
  protected readonly lineFilter = signal('');
  protected readonly loading = signal(false);
  protected readonly error = signal<string | null>(null);

  protected readonly columns: TableColumn<Station>[] = [
    { key: 'code', header: 'Kode', sortable: false },
    { key: 'name', header: 'Nama Stasiun', sortable: false },
    { key: 'line_name', header: 'Jalur / Line', sortable: false, render: (s) => s.line.name },
    { key: 'line_type', header: 'Tipe', align: 'center', sortable: false, render: (s) => s.line.type }
  ];

  constructor() {
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
      .getStations(this.lineFilter() || undefined)
      .pipe(takeUntilDestroyed(this.destroyRef), finalize(() => this.loading.set(false)))
      .subscribe({
        next: (stations) => this.data.set(stations),
        error: () => this.error.set('Gagal memuat data stasiun.')
      });
  }

  protected onLineChange(event: Event): void {
    this.lineFilter.set((event.target as HTMLSelectElement).value);
    this.load();
  }

  protected retry(): void {
    this.load();
  }
}
