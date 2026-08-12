import type { TemplateRef } from '@angular/core';
import { Component, input, output } from '@angular/core';
import { NgTemplateOutlet } from '@angular/common';

import type { SortOrder } from '../../../core/models/api.types';
import { SkeletonLoader } from '../skeleton-loader/skeleton-loader';

export interface TableColumn<T> {
  key: string;
  header: string;
  align?: 'left' | 'center' | 'right';
  sortable?: boolean;
  render?: (row: T) => string;
  cellTemplate?: TemplateRef<{ $implicit: T }>;
}

@Component({
  selector: 'app-data-table',
  imports: [NgTemplateOutlet, SkeletonLoader],
  templateUrl: './data-table.html',
  styleUrl: './data-table.scss'
})
export class DataTable<T> {
  readonly columns = input.required<TableColumn<T>[]>();
  readonly data = input.required<T[]>();
  readonly loading = input(false);
  readonly sortKey = input<string | null>(null);
  readonly sortOrder = input<SortOrder>('asc');
  readonly emptyMessage = input('Tidak ada data.');

  readonly sortChange = output<{ key: string; order: SortOrder }>();

  protected readonly trackRow = (_index: number, row: T): unknown => {
    const id = (row as Record<string, unknown>)['id'];
    return id ?? row;
  };

  protected readonly sortIndicator = (): string => (this.sortOrder() === 'asc' ? '▲' : '▼');

  protected onSort(column: TableColumn<T>): void {
    if (!column.sortable) return;
    const nextOrder: SortOrder =
      this.sortKey() === column.key && this.sortOrder() === 'asc' ? 'desc' : 'asc';
    this.sortChange.emit({ key: column.key, order: nextOrder });
  }

  protected cellValue(row: T, column: TableColumn<T>): string {
    if (column.render) return column.render(row);
    const value = (row as Record<string, unknown>)[column.key];
    return value === null || value === undefined ? '' : String(value);
  }

  protected readonly columnAlign = (column: TableColumn<T>): string => column.align ?? 'left';

  protected readonly skeletonRows = (): number[] => Array.from({ length: 5 }, (_, i) => i);
  protected readonly skeletonCols = (): number[] =>
    this.columns().map((_, i) => i);
}
