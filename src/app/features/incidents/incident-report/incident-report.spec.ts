import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { provideRouter } from '@angular/router';

import { mockApiInterceptor } from '../../../core/interceptors/mock-api.interceptor';
import { IncidentReport } from './incident-report';

describe('IncidentReport', () => {
  let component: IncidentReport;
  let fixture: ComponentFixture<IncidentReport>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [IncidentReport],
      providers: [
        provideHttpClient(withInterceptors([mockApiInterceptor])),
        provideRouter([])
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(IncidentReport);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should be invalid when description is empty', () => {
    component.form.controls.lineType.setValue('MRT');
    component.form.controls.trainId.setValue(1);
    component.form.controls.locationStation.setValue('Blok M');
    component.form.controls.delayDuration.setValue(10);
    component.form.controls.description.setValue('');

    expect(component.form.controls.description.hasError('required')).toBe(true);
    expect(component.form.valid).toBe(false);
  });

  it('should validate locationStation min length 3', () => {
    const control = component.form.controls.locationStation;
    control.setValue('BM');
    expect(control.hasError('minlength')).toBe(true);
    control.setValue('Blok M');
    expect(control.valid).toBe(true);
  });

  it('should validate delayDuration range 0-300', () => {
    const control = component.form.controls.delayDuration;
    control.setValue(301);
    expect(control.hasError('max')).toBe(true);
    control.setValue(-1);
    expect(control.hasError('min')).toBe(true);
    control.setValue(25);
    expect(control.valid).toBe(true);
  });

  it('should validate description max length 500', () => {
    const control = component.form.controls.description;
    control.setValue('x'.repeat(501));
    expect(control.hasError('maxlength')).toBe(true);
  });
});
