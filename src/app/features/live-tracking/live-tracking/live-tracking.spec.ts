import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient, withInterceptors } from '@angular/common/http';

import { mockApiInterceptor } from '../../../core/interceptors/mock-api.interceptor';
import { LiveTracking } from './live-tracking';

describe('LiveTracking', () => {
  let component: LiveTracking;
  let fixture: ComponentFixture<LiveTracking>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LiveTracking],
      providers: [provideHttpClient(withInterceptors([mockApiInterceptor]))]
    }).compileComponents();

    fixture = TestBed.createComponent(LiveTracking);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
