import { ComponentFixture, TestBed } from '@angular/core/testing';
import { LiveMap } from './live-map';
import type { TrainPosition } from '../../../core/models/position.model';

function position(overrides: Partial<TrainPosition> = {}): TrainPosition {
  return {
    train: {
      id: 1,
      trainCode: 'MRT-NS-101',
      line: { id: 1, code: 'MRT_NS', name: 'MRT North-South Line', type: 'MRT', colorHex: '#00529B', isActive: true },
      capacity: 1200,
      status: 'ACTIVE',
      createdAt: '',
      updatedAt: ''
    },
    currentStation: null,
    latitude: -6.2445,
    longitude: 106.7981,
    speedKmh: 55,
    status: 'IN_TRANSIT',
    lastUpdatedAt: '2026-08-12T09:00:00+07:00',
    ...overrides
  };
}

describe('LiveMap', () => {
  let fixture: ComponentFixture<LiveMap>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({ imports: [LiveMap] }).compileComponents();
    fixture = TestBed.createComponent(LiveMap);
    fixture.componentRef.setInput('positions', [position()]);
    fixture.detectChanges();
    await new Promise((resolve) => setTimeout(resolve, 50));
  });

  it('renders a marker per train position', () => {
    const markers = document.querySelectorAll('.live-map__marker');
    expect(markers.length).toBe(1);
  });

  it('opens the train modal when a marker is clicked', () => {
    const marker = document.querySelector('.live-map__marker') as HTMLElement;
    marker.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    fixture.detectChanges();

    const modal = document.querySelector('[data-testid="train-modal"]');
    expect(modal).toBeTruthy();
    expect(modal?.textContent).toContain('MRT-NS-101');
    expect(modal?.textContent).toContain('MRT North-South Line');
  });

  it('closes the modal via the close button', () => {
    const marker = document.querySelector('.live-map__marker') as HTMLElement;
    marker.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    fixture.detectChanges();

    const close = document.querySelector('.live-map-modal__close') as HTMLButtonElement;
    close.click();
    fixture.detectChanges();

    expect(document.querySelector('[data-testid="train-modal"]')).toBeNull();
  });
});
