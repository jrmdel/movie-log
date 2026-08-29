import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-movie-card',
  imports: [RouterLink],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <a
      [routerLink]="['/movies', id()]"
      class="flex w-full flex-col overflow-hidden rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-left shadow-sm transition hover:cursor-pointer hover:shadow-md"
    >
      @if (posterUrl(); as url) {
        <img
          [src]="url"
          [alt]="title() + ' poster'"
          loading="lazy"
          class="h-56 w-full object-cover"
        />
      } @else {
        <div
          class="flex h-56 w-full items-center justify-center bg-gray-100 dark:bg-gray-700 text-sm text-gray-400"
        >
          No poster
        </div>
      }
      <div class="p-3">
        <p class="truncate font-medium text-gray-900 dark:text-gray-100">{{ title() }}</p>
        <div class="mt-1 flex items-center justify-between text-sm text-gray-500">
          <span>{{ year() }}</span>
          @if (rating(); as movieRating) {
            <span class="text-amber-600">★ {{ movieRating }}</span>
          }
        </div>
      </div>
    </a>
  `,
})
export class MovieCard {
  readonly id = input.required<string | number>();
  readonly title = input.required<string>();
  readonly year = input<number>();
  readonly posterUrl = input<string>();
  readonly rating = input<number>();
}
