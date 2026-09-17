import { Injectable, signal } from '@angular/core';

const THEME_KEY = 'amigo_invisible_theme';

@Injectable({ providedIn: 'root' })
export class ThemeService {
  readonly isDark = signal(this.readStoredPreference());

  constructor() {
    this.applyToDocument(this.isDark());
  }

  toggle(): void {
    const next = !this.isDark();
    this.isDark.set(next);
    localStorage.setItem(THEME_KEY, next ? 'dark' : 'light');
    this.applyToDocument(next);
  }

  private applyToDocument(dark: boolean): void {
    document.body.classList.toggle('dark-theme', dark);
  }

  private readStoredPreference(): boolean {
    const stored = localStorage.getItem(THEME_KEY);
    if (stored) return stored === 'dark';
    // si nunca eligio nada, respeta la preferencia del sistema operativo
    return window.matchMedia?.('(prefers-color-scheme: dark)').matches ?? false;
  }
}
