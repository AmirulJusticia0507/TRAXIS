import { ComponentFixture, TestBed } from '@angular/core/testing';

import { StatusBadge } from './status-badge';

describe('StatusBadge', () => {
  let component: StatusBadge;
  let fixture: ComponentFixture<StatusBadge>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [StatusBadge]
    }).compileComponents();

    fixture = TestBed.createComponent(StatusBadge);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('status', 'ACTIVE');
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should render humanized label for ACTIVE', () => {
    fixture.componentRef.setInput('status', 'ACTIVE');
    fixture.detectChanges();
    const text = fixture.nativeElement.textContent as string;
    expect(text).toContain('Active');
  });

  it('should render humanized label for OUT_OF_SERVICE', () => {
    fixture.componentRef.setInput('status', 'OUT_OF_SERVICE');
    fixture.detectChanges();
    const text = fixture.nativeElement.textContent as string;
    expect(text).toContain('Out of service');
  });

  it('should apply danger tone for OUT_OF_SERVICE', () => {
    fixture.componentRef.setInput('status', 'OUT_OF_SERVICE');
    fixture.detectChanges();
    const el = fixture.nativeElement.querySelector('.status-badge') as HTMLElement;
    expect(el.classList.contains('status-badge--danger')).toBe(true);
  });

  it('should apply success tone for ON_TIME', () => {
    fixture.componentRef.setInput('status', 'ON_TIME');
    fixture.detectChanges();
    const el = fixture.nativeElement.querySelector('.status-badge') as HTMLElement;
    expect(el.classList.contains('status-badge--success')).toBe(true);
  });
});
