import { Component, input, output } from '@angular/core';

@Component({
  selector: 'app-paginator',
  imports: [],
  templateUrl: './paginator.html',
  styleUrl: './paginator.scss'
})
export class Paginator {
  readonly page = input.required<number>();
  readonly totalPages = input.required<number>();
  readonly totalItems = input.required<number>();

  readonly pageChange = output<number>();

  protected readonly canPrev = (): boolean => this.page() > 1;
  protected readonly canNext = (): boolean => this.page() < this.totalPages();

  protected onPrev(): void {
    if (this.canPrev()) this.pageChange.emit(this.page() - 1);
  }

  protected onNext(): void {
    if (this.canNext()) this.pageChange.emit(this.page() + 1);
  }
}
