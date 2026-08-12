import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { provideRouter } from '@angular/router';

import { mockApiInterceptor } from '../../../core/interceptors/mock-api.interceptor';
import { TrainList } from './train-list';

describe('TrainList', () => {
  let component: TrainList;
  let fixture: ComponentFixture<TrainList>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TrainList],
      providers: [
        provideHttpClient(withInterceptors([mockApiInterceptor])),
        provideRouter([])
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(TrainList);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
