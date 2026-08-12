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

  it('renders train rows with data in each column', async () => {
    const text = fixture.nativeElement.textContent;
    expect(text).toContain('MRT-NS-101');
    expect(text).toContain('MRT North-South Line');
    expect(text).toContain('Active');
  });

  it('does not render empty cells for mapped columns', async () => {
    const cells = Array.from(
      fixture.nativeElement.querySelectorAll('td')
    ) as HTMLTableCellElement[];
    expect(cells.length).toBeGreaterThan(0);
    expect(cells.every((cell) => cell.textContent?.trim().length)).toBe(true);
  });
});
