import { Component } from '@angular/core';

@Component({
  selector: 'app-movie-card-skeleton',
  template: `
    <div
      class="flex w-full flex-col overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm dark:border-gray-700 dark:bg-gray-800"
      aria-hidden="true"
    >
      <!-- Zone poster (h-56) -->
      <div class="h-56 w-full animate-pulse bg-gray-200 dark:bg-gray-700"></div>

      <!-- Contenu (p-3) -->
      <div class="p-3">
        <!-- Titre (reproduit text-gray-900 / font-medium) -->
        <div class="h-5 w-3/4 animate-pulse rounded bg-gray-200 dark:bg-gray-700"></div>

        <!-- Meta (mt-1, année à gauche, note à droite) -->
        <div class="mt-2 flex items-center justify-between">
          <div class="h-4 w-10 animate-pulse rounded bg-gray-200 dark:bg-gray-700"></div>
          <div class="h-4 w-12 animate-pulse rounded bg-gray-200 dark:bg-gray-700"></div>
        </div>
      </div>
    </div>
  `,
})
export class MovieCardSkeletonComponent {}
