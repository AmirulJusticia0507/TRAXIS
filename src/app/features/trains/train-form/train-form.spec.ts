import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { provideRouter } from '@angular/router';

import { mockApiInterceptor } from '../../../core/interceptors/mock-api.interceptor';
import { TrainForm } from './train-form';

describe('TrainForm', () => {
  let component: TrainForm;
  let fixture: ComponentFixture<TrainForm>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TrainForm],
      providers: [
        provideHttpClient(withInterceptors([mockApiInterceptor])),
        provideRouter([])
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(TrainForm);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should validate required fields', () => {
    expect(component.form.valid).toBe(false);
    expect(component.form.controls.trainCode.hasError('required')).toBe(true);
    expect(component.form.controls.lineId.hasError('required')).toBe(true);
  });

  it('should validate capacity range 0-3000', () => {
    const capacity = component.form.controls.capacity;
    capacity.setValue(-1);
    expect(capacity.hasError('min')).toBe(true);
    capacity.setValue(3001);
    expect(capacity.hasError('max')).toBe(true);
    capacity.setValue(1200);
    expect(capacity.valid).toBe(true);
  });
});
