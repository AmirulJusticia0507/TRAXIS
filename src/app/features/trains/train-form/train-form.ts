import { Component, DestroyRef, inject, OnInit, signal } from '@angular/core';
import { NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { finalize } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

import type { TrainStatus } from '../../../core/models/api.types';
import type { Line } from '../../../core/models/line.model';
import type { Train, TrainCreate } from '../../../core/models/train.model';
import { ApiService } from '../../../core/services/api.service';
import { ErrorState } from '../../../shared/components/error-state/error-state';
import { PageHeader } from '../../../shared/components/page-header/page-header';

const TRAIN_STATUSES: TrainStatus[] = ['ACTIVE', 'MAINTENANCE', 'DELAYED'];

@Component({
  selector: 'app-train-form',
  imports: [ReactiveFormsModule, ErrorState, PageHeader],
  templateUrl: './train-form.html',
  styleUrl: './train-form.scss'
})
export class TrainForm implements OnInit {
  private readonly api = inject(ApiService);
  private readonly fb = inject(NonNullableFormBuilder);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly destroyRef = inject(DestroyRef);

  private readonly editId = signal<number | null>(null);

  protected readonly lines = signal<Line[]>([]);
  protected readonly loading = signal(false);
  protected readonly submitting = signal(false);
  protected readonly error = signal<string | null>(null);
  protected readonly statusOptions = TRAIN_STATUSES;

  readonly form = this.fb.group({
    trainCode: this.fb.control('', [Validators.required, Validators.minLength(3), Validators.maxLength(20)]),
    lineId: this.fb.control<number | null>(null, [Validators.required]),
    capacity: this.fb.control(0, [Validators.required, Validators.min(0), Validators.max(3000)]),
    status: this.fb.control<TrainStatus>('ACTIVE', [Validators.required])
  });

  ngOnInit(): void {
    this.api.getLines().pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: (lines) => this.lines.set(lines),
      error: () => this.error.set('Gagal memuat data jalur.')
    });

    const idParam = this.route.snapshot.paramMap.get('id');
    if (idParam) {
      this.editId.set(Number(idParam));
      this.loadTrain(Number(idParam));
    }
  }

  protected readonly isEdit = (): boolean => this.editId() !== null;

  protected readonly title = (): string => (this.isEdit() ? 'Edit Armada Kereta' : 'Tambah Armada Kereta');

  private loadTrain(id: number): void {
    this.api
      .getTrains({ page: 1, limit: 100 })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (result) => {
          const train = result.data.find((t) => t.id === id);
          if (!train) {
            this.error.set('Armada tidak ditemukan.');
            return;
          }
          this.form.patchValue({
            trainCode: train.trainCode,
            lineId: train.line.id,
            capacity: train.capacity,
            status: train.status
          });
        },
        error: () => this.error.set('Gagal memuat data armada.')
      });
  }

  protected onSubmit(): void {
    if (this.form.invalid || this.submitting()) return;

    const value = this.form.getRawValue();
    const payload: TrainCreate = {
      trainCode: value.trainCode,
      lineId: value.lineId as number,
      capacity: value.capacity,
      status: value.status
    };
    this.submitting.set(true);
    this.error.set(null);

    const request$ = this.isEdit()
      ? this.api.updateTrain(this.editId() as number, payload)
      : this.api.createTrain(payload);

    request$.pipe(takeUntilDestroyed(this.destroyRef), finalize(() => this.submitting.set(false))).subscribe({
      next: (train: Train) => {
        this.router.navigate(['/trains'], { queryParams: { created: train.trainCode } });
      },
      error: () => this.error.set('Gagal menyimpan data armada. Periksa kembali input Anda.')
    });
  }
}
