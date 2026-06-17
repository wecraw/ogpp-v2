import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';

import { HeaderComponent } from './header.component';

describe('HeaderComponent', () => {
  let component: HeaderComponent;
  let fixture: ComponentFixture<HeaderComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HeaderComponent],
      providers: [provideRouter([])]
    }).compileComponents();

    fixture = TestBed.createComponent(HeaderComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('creates with the menu closed', () => {
    expect(component).toBeTruthy();
    expect(component.menuOpen).toBeFalse();
    expect(fixture.nativeElement.querySelector('.menu-dropdown')).toBeNull();
  });

  it('opens and closes the builds menu', () => {
    component.toggleMenu();
    fixture.detectChanges();

    const menuItem = fixture.nativeElement.querySelector('.menu-item') as HTMLElement;
    expect(component.menuOpen).toBeTrue();
    expect(menuItem.textContent).toContain('My Builds');

    component.closeMenu();
    fixture.detectChanges();

    expect(component.menuOpen).toBeFalse();
    expect(fixture.nativeElement.querySelector('.menu-dropdown')).toBeNull();
  });
});
