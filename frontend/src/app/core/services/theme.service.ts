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
    // Arranca siempre en modo claro por default. Solo pasa a oscuro si el
    // usuario lo eligio a mano con el boton (y ahi se guarda en localStorage).
    return stored === 'dark';
  }
}
