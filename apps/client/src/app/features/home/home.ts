import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { HistoryApiService } from '@src/app/core/api/history-api.service';
import { AuthService } from '@src/app/core/auth/auth.service';
import { NotificationService } from '@src/app/core/services/notification.service';
import { MovieCard } from '@src/app/shared/components/movie-card/movie-card';
import { MovieCardSkeletonComponent } from '@src/app/shared/components/movie-card/movie-card-skeleton';
import { debouncedSignal, minDurationSignal } from '@src/app/shared/tools/signals/signals.tools';
import { EMPTY } from 'rxjs';
import { catchError, take } from 'rxjs/operators';

@Component({
  selector: 'app-home',
  imports: [MovieCard, MovieCardSkeletonComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <h1 class="text-2xl font-semibold text-gray-900 dark:text-white">Welcome, {{ username() }}</h1>

    <section class="mt-6">
      <h2 class="text-lg font-medium text-gray-900 dark:text-gray-200">Recently watched</h2>

      @if (showLoader()) {
        <div class="mt-4 grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-5" aria-hidden="true">
          @for (i of [1, 2, 3, 4, 5]; track i) {
            <app-movie-card-skeleton />
          }
        </div>
      } @else {
        <div class="mt-4 grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-5">
          @for (movie of recentlyWatched(); track movie._id) {
            <app-movie-card
              [id]="movie.externalId"
              [title]="movie.title"
              [year]="movie.year"
              [rating]="movie.rating"
              [posterUrl]="movie.url"
            />
          } @empty {
            <p class="col-span-full text-sm text-gray-500 dark:text-gray-400">
              You haven't logged any movies yet. Search above to get started.
            </p>
          }
        </div>
      }
    </section>
  `,
})
export class Home {
  private readonly authService = inject(AuthService);
  private readonly historyApi = inject(HistoryApiService);
  private readonly notificationService = inject(NotificationService);

  private readonly loading = computed(() => !this.historyApi.isInitialized());
  protected readonly showLoader = minDurationSignal(debouncedSignal(this.loading, 50), 500);
  protected readonly recentlyWatched = this.historyApi.recentlyWatched;

  constructor() {
    this.historyApi
      .fetchRecentlyWatched()
      .pipe(
        take(1),
        catchError(() => {
          this.notificationService.error('Failed to load recently watched movies.');
          return EMPTY;
        }),
      )
      .subscribe();
  }

  protected username(): string {
    return this.authService.currentUser()?.username ?? '';
  }
}
