import { Component, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';

type ThemePreference = 'system' | 'light' | 'dark';

@Component({
  selector: 'app-header',
  imports: [RouterLink],
  templateUrl: './header.component.html',
  styleUrl: './header.component.scss'
})
export class HeaderComponent implements OnInit {
  private readonly themeStorageKey = 'ogpp_theme_preference';

  menuOpen = false;
  themePreference: ThemePreference = 'system';

  ngOnInit(): void {
    const savedPreference = localStorage.getItem(this.themeStorageKey);

    if (this.isThemePreference(savedPreference)) {
      this.themePreference = savedPreference;
    }

    this.applyThemePreference();
  }

  toggleMenu(): void {
    this.menuOpen = !this.menuOpen;
  }

  closeMenu(): void {
    this.menuOpen = false;
  }

  toggleThemePreference(): void {
    this.themePreference = this.themePreference === 'dark' ? 'light' : 'dark';
    localStorage.setItem(this.themeStorageKey, this.themePreference);
    this.applyThemePreference();
  }

  useSystemTheme(): void {
    this.themePreference = 'system';
    localStorage.removeItem(this.themeStorageKey);
    this.applyThemePreference();
  }

  get themeToggleLabel(): string {
    return this.themePreference === 'dark' ? 'Use Light Mode' : 'Use Dark Mode';
  }

  private applyThemePreference(): void {
    if (this.themePreference === 'system') {
      document.documentElement.removeAttribute('data-theme');
      return;
    }

    document.documentElement.setAttribute('data-theme', this.themePreference);
  }

  private isThemePreference(value: string | null): value is ThemePreference {
    return value === 'system' || value === 'light' || value === 'dark';
  }
}
