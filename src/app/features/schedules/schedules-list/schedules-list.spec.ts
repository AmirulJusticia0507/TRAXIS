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

  it('renders schedule rows with data in each column', async () => {
    const text = fixture.nativeElement.textContent;
    expect(text).toContain('MRT-NS-101');
    expect(text).toContain('MRT North-South Line');
    expect(text).toContain('Lebak Bulus');
    expect(text).toContain('Bundaran HI');
    expect(text).toContain('ON_TIME');
  });

  it('does not render empty cells for mapped columns', async () => {
    const cells = Array.from(
      fixture.nativeElement.querySelectorAll('td')
    ) as HTMLTableCellElement[];
    const nonEmpty = cells.filter((cell) => cell.textContent?.trim().length);
    expect(nonEmpty.length).toBeGreaterThan(0);
    expect(cells.every((cell) => cell.textContent?.trim().length)).toBe(true);
  });
});
