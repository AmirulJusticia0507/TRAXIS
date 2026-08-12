import { Component, DestroyRef, inject, OnInit, signal } from '@angular/core';
import { NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { finalize } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

import type { LineType } from '../../../core/models/api.types';
import type { Train } from '../../../core/models/train.model';
import { ApiService } from '../../../core/services/api.service';
import { ErrorState } from '../../../shared/components/error-state/error-state';
import { PageHeader } from '../../../shared/components/page-header/page-header';

/**
 * Form "Pencatatan Insiden Jalur" - spesifikasi persis mengikuti FORMS.md.
 */
@Component({
  selector: 'app-incident-report',
  imports: [ReactiveFormsModule, RouterLink, ErrorState, PageHeader],
  templateUrl: './incident-report.html',
  styleUrl: './incident-report.scss'
})
export class IncidentReport implements OnInit {
  private readonly api = inject(ApiService);
  private readonly fb = inject(NonNullableFormBuilder);
  private readonly router = inject(Router);
  private readonly destroyRef = inject(DestroyRef);

  protected readonly trains = signal<Train[]>([]);
  protected readonly loading = signal(false);
  protected readonly submitting = signal(false);
  protected readonly error = signal<string | null>(null);

  readonly form = this.fb.group({
    lineType: this.fb.control<LineType>('MRT', [Validators.required]),
    trainId: this.fb.control<number | null>(null, [Validators.required]),
    locationStation: this.fb.control('', [Validators.required, Validators.minLength(3)]),
    delayDuration: this.fb.control(0, [Validators.min(0), Validators.max(300)]),
    description: this.fb.control('', [Validators.required, Validators.maxLength(500)])
  });

  ngOnInit(): void {
    this.api
      .getTrains({ page: 1, limit: 100 })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (result) => this.trains.set(result.data),
        error: () => this.error.set('Gagal memuat data armada.')
      });
  }

  protected onSubmit(): void {
    if (this.form.invalid || this.submitting()) return;

    const value = this.form.getRawValue();
    this.submitting.set(true);
    this.error.set(null);

    this.api
      .createIncident({
        lineType: value.lineType,
        trainId: value.trainId,
        locationStation: value.locationStation,
        delayDurationMinutes: value.delayDuration,
        description: value.description
      })
      .pipe(takeUntilDestroyed(this.destroyRef), finalize(() => this.submitting.set(false)))
      .subscribe({
        next: () => this.router.navigate(['/incidents']),
        error: () => this.error.set('Gagal mengirim laporan insiden. Periksa kembali input Anda.')
      });
  }
}
