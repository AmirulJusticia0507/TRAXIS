import { Component, input, output } from '@angular/core';

@Component({
  selector: 'app-error-state',
  imports: [],
  templateUrl: './error-state.html',
  styleUrl: './error-state.scss'
})
export class ErrorState {
  readonly message = input('Terjadi kesalahan saat memuat data.');
  readonly retry = output<void>();
}
