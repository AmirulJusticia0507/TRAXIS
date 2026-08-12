import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DataTable, TableColumn } from './data-table';

interface TestRow {
  id: number;
  name: string;
}

describe('DataTable', () => {
  let component: DataTable<TestRow>;
  let fixture: ComponentFixture<DataTable<TestRow>>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DataTable]
    }).compileComponents();

    fixture = TestBed.createComponent(DataTable<TestRow>);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should render row values from render function', () => {
    const columns: TableColumn<TestRow>[] = [
      { key: 'name', header: 'Nama', render: (row) => row.name.toUpperCase() }
    ];
    fixture.componentRef.setInput('columns', columns);
    fixture.componentRef.setInput('data', [{ id: 1, name: 'Bogor' }]);
    fixture.detectChanges();

    const cell = fixture.nativeElement.querySelector('tbody td') as HTMLElement;
    expect(cell.textContent).toContain('BOGOR');
  });

  it('should emit sortChange when sortable header clicked', () => {
    const columns: TableColumn<TestRow>[] = [
      { key: 'name', header: 'Nama', sortable: true }
    ];
    fixture.componentRef.setInput('columns', columns);
    fixture.componentRef.setInput('data', [{ id: 1, name: 'A' }]);
    fixture.detectChanges();

    let emitted: { key: string; order: string } | undefined;
    component.sortChange.subscribe((e) => (emitted = e));

    const th = fixture.nativeElement.querySelector('th[data-testid="sort-name"]') as HTMLElement;
    th.click();
    expect(emitted).toEqual({ key: 'name', order: 'asc' });
  });
});
