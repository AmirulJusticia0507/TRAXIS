import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { App } from './app';

describe('App', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [App],
      providers: [provideRouter([])]
    }).compileComponents();
  });

  it('should create the app', () => {
    const fixture = TestBed.createComponent(App);
    expect(fixture.componentInstance).toBeTruthy();
  });

  it('should render brand name', () => {
    const fixture = TestBed.createComponent(App);
    fixture.detectChanges();
    const brand = fixture.nativeElement.querySelector('[data-testid="brand-link"]')?.textContent;
    expect(brand).toContain('TRAXIS');
  });
});
