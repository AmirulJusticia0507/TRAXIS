import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient, withInterceptors } from '@angular/common/http';

import { mockApiInterceptor } from '../../../core/interceptors/mock-api.interceptor';
import { StationsList } from './stations-list';

describe('StationsList', () => {
  let component: StationsList;
  let fixture: ComponentFixture<StationsList>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [StationsList],
      providers: [provideHttpClient(withInterceptors([mockApiInterceptor]))]
    }).compileComponents();

    fixture = TestBed.createComponent(StationsList);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
