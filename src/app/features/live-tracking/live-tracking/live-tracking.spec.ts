import { Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient, withInterceptors } from '@angular/common/http';

import { mockApiInterceptor } from '../../../core/interceptors/mock-api.interceptor';
import { LiveMap } from '../../../shared/components/live-map/live-map';
import { LiveTracking } from './live-tracking';

@Component({
  selector: 'app-live-map',
  template: ''
})
class LiveMapStub {}

describe('LiveTracking', () => {
  let component: LiveTracking;
  let fixture: ComponentFixture<LiveTracking>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LiveTracking],
      providers: [provideHttpClient(withInterceptors([mockApiInterceptor]))]
    })
      .overrideComponent(LiveTracking, {
        remove: { imports: [LiveMap] },
        add: { imports: [LiveMapStub] }
      })
      .compileComponents();

    fixture = TestBed.createComponent(LiveTracking);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
