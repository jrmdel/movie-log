import { inject, Injectable, signal } from '@angular/core';
import { DOCUMENT } from '@angular/common';
import { ThemeMode } from '@src/app/features/profile/components/theme/theme.model';

@Injectable({ providedIn: 'root' })
export class ThemeService {
  private document = inject(DOCUMENT);
  private mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');

  // Signal initialisé avec la valeur enregistrée ou 'system' par défaut
  mode = signal<ThemeMode>((localStorage.getItem('theme-mode') as ThemeMode) || 'system');

  constructor() {
    // Applique le thème au démarrage
    this.applyTheme(this.mode());

    // Écoute les changements de préférences de l'OS en temps réel
    this.mediaQuery.addEventListener('change', (e) => {
      if (this.mode() === 'system') {
        this.toggleDarkClass(e.matches);
      }
    });
  }

  setMode(newMode: ThemeMode): void {
    this.mode.set(newMode);
    localStorage.setItem('theme-mode', newMode);
    this.applyTheme(newMode);
  }

  private applyTheme(mode: ThemeMode): void {
    if (mode === 'system') {
      this.toggleDarkClass(this.mediaQuery.matches);
    } else {
      this.toggleDarkClass(mode === 'dark');
    }
  }

  private toggleDarkClass(isDark: boolean): void {
    const html = this.document.documentElement;
    if (isDark) {
      html.classList.add('dark');
    } else {
      html.classList.remove('dark');
    }
  }
}
