import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { provideRouter } from '@angular/router';

import { mockApiInterceptor } from '../../../core/interceptors/mock-api.interceptor';
import { IncidentList } from './incident-list';

describe('IncidentList', () => {
  let component: IncidentList;
  let fixture: ComponentFixture<IncidentList>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [IncidentList],
      providers: [
        provideHttpClient(withInterceptors([mockApiInterceptor])),
        provideRouter([])
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(IncidentList);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
