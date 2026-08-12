import { Component, input } from '@angular/core';

@Component({
  selector: 'app-skeleton-loader',
  imports: [],
  templateUrl: './skeleton-loader.html',
  styleUrl: './skeleton-loader.scss'
})
export class SkeletonLoader {
  readonly rows = input(1);
  readonly cols = input(4);

  protected readonly rowIndexes = (): number[] => Array.from({ length: this.rows() }, (_, i) => i);
  protected readonly colIndexes = (): number[] => Array.from({ length: this.cols() }, (_, i) => i);
}
