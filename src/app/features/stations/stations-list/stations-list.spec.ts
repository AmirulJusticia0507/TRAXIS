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

  it('renders station rows with data in each column', async () => {
    const text = fixture.nativeElement.textContent;
    expect(text).toContain('Lebak Bulus');
    expect(text).toContain('MRT North-South Line');
    expect(text).toContain('MRT');
  });

  it('does not render empty cells', async () => {
    const cells = Array.from(
      fixture.nativeElement.querySelectorAll('td')
    ) as HTMLTableCellElement[];
    expect(cells.length).toBeGreaterThan(0);
    expect(cells.every((cell) => cell.textContent?.trim().length)).toBe(true);
  });
});
