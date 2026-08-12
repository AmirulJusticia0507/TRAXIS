import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient, withInterceptors } from '@angular/common/http';

import { mockApiInterceptor } from '../../../core/interceptors/mock-api.interceptor';
import { SchedulesList } from './schedules-list';

describe('SchedulesList', () => {
  let component: SchedulesList;
  let fixture: ComponentFixture<SchedulesList>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SchedulesList],
      providers: [provideHttpClient(withInterceptors([mockApiInterceptor]))]
    }).compileComponents();

    fixture = TestBed.createComponent(SchedulesList);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
