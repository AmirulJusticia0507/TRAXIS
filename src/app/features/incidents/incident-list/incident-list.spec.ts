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

  it('renders incident rows with data in each column', async () => {
    const text = fixture.nativeElement.textContent;
    expect(text).toContain('KRL');
    expect(text).toContain('Manggarai');
    expect(text).toContain('Resolved');
  });

  it('does not render empty cells for mapped columns', async () => {
    const rows = fixture.nativeElement.querySelectorAll('[data-testid="table-row"]');
    expect(rows.length).toBeGreaterThan(0);
    for (const row of Array.from(rows) as HTMLTableRowElement[]) {
      const cells = Array.from(
        row.querySelectorAll('td')
      ).slice(0, 6) as HTMLTableCellElement[];
      expect(cells.every((cell) => cell.textContent?.trim().length)).toBe(true);
    }
  });
});
