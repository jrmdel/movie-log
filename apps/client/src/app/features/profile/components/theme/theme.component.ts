import { Component, inject } from '@angular/core';
import { ThemeService } from '@src/app/features/profile/components/theme/theme.service';

@Component({
  selector: 'app-theme-settings',
  template: `<section class="mt-8 max-w-sm">
    <h2 class="text-sm font-medium text-gray-800 dark:text-gray-200">Appearance</h2>
    <p class="mt-1 text-xs text-gray-500 dark:text-gray-400">
      Choose how the application looks to you.
    </p>

    <div
      class="mt-3 grid grid-cols-3 gap-2 rounded-lg border border-gray-200 bg-gray-50 p-1 dark:border-gray-700 dark:bg-gray-800/50"
    >
      <button
        type="button"
        (click)="themeService.setMode('light')"
        [class]="buttonClass(themeService.mode() === 'light')"
      >
        <svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"
          />
        </svg>
        <span>Light</span>
      </button>

      <button
        type="button"
        (click)="themeService.setMode('dark')"
        [class]="buttonClass(themeService.mode() === 'dark')"
      >
        <svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"
          />
        </svg>
        <span>Dark</span>
      </button>

      <button
        type="button"
        (click)="themeService.setMode('system')"
        [class]="buttonClass(themeService.mode() === 'system')"
      >
        <svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
          />
        </svg>
        <span>System</span>
      </button>
    </div>
  </section>`,
})
export class ThemeSettingsComponent {
  readonly themeService = inject(ThemeService);

  protected buttonClass(isActive: boolean): string {
    const base =
      'flex items-center justify-center gap-2 rounded-md py-1.5 text-xs font-medium transition-colors focus:outline-none';
    if (isActive) {
      return `${base} bg-white text-indigo-600 shadow-sm dark:bg-gray-700 dark:text-indigo-400`;
    }
    return `${base} text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white`;
  }
}
