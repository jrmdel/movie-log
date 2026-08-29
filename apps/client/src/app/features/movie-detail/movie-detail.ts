import { HttpErrorResponse } from '@angular/common/http';
import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ActivatedRoute } from '@angular/router';
import { forkJoin, of } from 'rxjs';
import { catchError, filter, finalize, map, switchMap, tap } from 'rxjs/operators';

import { HistoryApiService } from '@src/app/core/api/history-api.service';
import { ListApiService } from '@src/app/core/api/list-api.service';
import { MovieApiService } from '@src/app/core/api/movie-api.service';
import { EListType, IListDocument } from '@src/app/core/models/list.model';
import { IMovieDocument } from '@src/app/core/models/movie.model';
import { NotificationService } from '@src/app/core/services/notification.service';
import {
  ICustomListToggle,
  ListMembershipToggles,
} from '@src/app/features/movie-detail/list-membership-toggles/list-membership-toggles';
import { HistoryEntryForm } from '@src/app/shared/components/history-entry-form/history-entry-form';

@Component({
  selector: 'app-movie-detail',
  imports: [ListMembershipToggles, HistoryEntryForm],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @if (loading()) {
      <p class="text-sm text-gray-500 dark:text-gray-400">Loading…</p>
    } @else if (movie(); as movie) {
      <div class="grid gap-8 md:grid-cols-[200px_1fr]">
        <div class="relative h-72 w-full overflow-hidden rounded-lg md:h-80">
          @if (movie.url) {
            @if (isImageLoading()) {
              <div class="h-full w-full animate-pulse bg-gray-200 dark:bg-gray-700"></div>
            }

            <img
              [src]="movie.url"
              [alt]="movie.title"
              class="h-full w-full object-cover transition-opacity duration-300"
              [class.opacity-0]="isImageLoading()"
              [class.opacity-100]="!isImageLoading()"
              (load)="onImageLoad()"
              (error)="onImageError()"
            />
          } @else {
            <div
              class="flex h-full w-full items-center justify-center bg-gray-100 text-sm text-gray-400 dark:bg-gray-800 dark:text-gray-500"
            >
              No poster
            </div>
          }
        </div>

        <div>
          <h1 class="text-2xl font-semibold text-gray-900 dark:text-white">
            {{ movie.title }}
            <span class="text-gray-400 dark:text-gray-500">({{ movie.year }})</span>
          </h1>

          <dl class="mt-4 space-y-1 text-sm text-gray-600 dark:text-gray-300">
            @if (movie.genres.length > 0) {
              <div class="flex flex-wrap gap-1">
                <dt class="inline font-semibold text-gray-800 dark:text-gray-200">Genres:</dt>
                <dd class="inline">{{ movie.genres.join(', ') }}</dd>
              </div>
            }
            @if (movie.directors.length > 0) {
              <div class="flex flex-wrap gap-1">
                <dt class="inline font-semibold text-gray-800 dark:text-gray-200">Director:</dt>
                <dd class="inline">{{ movie.directors.join(', ') }}</dd>
              </div>
            }
            @if (movie.stars.length > 0) {
              <div class="flex flex-wrap gap-1">
                <dt class="inline font-semibold text-gray-800 dark:text-gray-200">Stars:</dt>
                <dd class="inline">{{ movie.stars.join(', ') }}</dd>
              </div>
            }
            @if (movie.rating) {
              <div class="flex flex-wrap gap-1">
                <dt class="inline font-semibold text-gray-800 dark:text-gray-200">IMDb rating:</dt>
                <dd class="inline text-amber-600 dark:text-amber-400">★ {{ movie.rating }}</dd>
              </div>
            }
          </dl>

          <app-list-membership-toggles
            [inWatchlist]="inWatchlist()"
            [inFavorites]="inFavorites()"
            [customLists]="customListToggles()"
            (toggleWatchlist)="toggleWatchlist()"
            (toggleFavorites)="toggleFavorites()"
            (toggleCustomList)="toggleCustomList($event)"
          />

          <div
            class="mt-8 max-w-sm rounded-lg border border-gray-200 p-4 dark:border-gray-700 dark:bg-gray-800/40"
          >
            <h2 class="text-sm font-medium text-gray-800 dark:text-gray-200">Log as watched</h2>
            <app-history-entry-form
              [(viewedAt)]="viewedAt"
              [(rating)]="rating"
              [(notes)]="notes"
              [saving]="logging()"
              (save)="logWatched()"
            />
          </div>
        </div>
      </div>
    } @else {
      <p class="text-sm text-gray-500 dark:text-gray-400">Movie not found.</p>
    }
  `,
})
export class MovieDetail {
  private readonly route = inject(ActivatedRoute);
  private readonly movieApi = inject(MovieApiService);
  private readonly listApi = inject(ListApiService);
  private readonly historyApi = inject(HistoryApiService);
  private readonly notificationService = inject(NotificationService);

  protected readonly loading = signal(true);
  protected readonly isImageLoading = signal<boolean>(true);
  protected readonly movie = signal<IMovieDocument | null>(null);
  protected readonly watchlist = signal<IListDocument | null>(null);
  protected readonly favorites = signal<IListDocument | null>(null);
  protected readonly customLists = signal<IListDocument[]>([]);

  protected readonly inWatchlist = computed(() => this.isMember(this.watchlist()));
  protected readonly inFavorites = computed(() => this.isMember(this.favorites()));
  protected readonly customListToggles = computed<ICustomListToggle[]>(() =>
    this.customLists().map((list) => ({ list, active: this.isMember(list) })),
  );

  protected readonly viewedAt = signal(new Date().toISOString().slice(0, 10));
  protected readonly rating = signal(0);
  protected readonly notes = signal('');
  protected readonly logging = signal(false);

  constructor() {
    this.route.paramMap
      .pipe(
        map((params) => params.get('id')),
        filter((id): id is string => !!id),
        switchMap((id) => this.loadMovie(id)),
        takeUntilDestroyed(),
      )
      .subscribe();
  }

  protected onImageLoad(): void {
    this.isImageLoading.set(false);
  }

  protected onImageError(): void {
    this.isImageLoading.set(false);
  }

  protected toggleWatchlist(): void {
    this.toggleListMembership(this.watchlist(), this.inWatchlist(), (list) =>
      this.watchlist.set(list),
    );
  }

  protected toggleFavorites(): void {
    this.toggleListMembership(this.favorites(), this.inFavorites(), (list) =>
      this.favorites.set(list),
    );
  }

  protected toggleCustomList(list: IListDocument): void {
    this.toggleListMembership(list, this.isMember(list), (updated) => {
      this.customLists.update((lists) =>
        lists.map((current) => (current._id === updated._id ? updated : current)),
      );
    });
  }

  protected logWatched(): void {
    const movie = this.movie();
    if (!movie || this.logging()) {
      return;
    }

    this.logging.set(true);
    this.historyApi
      .create({
        movieId: movie._id,
        viewedAt: this.viewedAt() || undefined,
        rating: this.rating() || undefined,
        notes: this.notes().trim() || undefined,
      })
      .subscribe({
        next: () => {
          this.logging.set(false);
          this.notes.set('');
          this.notificationService.success('Logged as watched.');
        },
        error: (error: unknown) => {
          this.logging.set(false);
          this.notificationService.error(
            error instanceof HttpErrorResponse && error.status === 409
              ? 'You already logged this movie on that date.'
              : 'Failed to log this movie.',
          );
        },
      });
  }

  private isMember(list: IListDocument | null): boolean {
    const movie = this.movie();
    return !!movie && !!list && list.movieIds.includes(movie._id);
  }

  private toggleListMembership(
    list: IListDocument | null,
    isMember: boolean,
    apply: (list: IListDocument) => void,
  ): void {
    const movie = this.movie();
    if (!movie || !list) {
      return;
    }

    const request$ = isMember
      ? this.listApi.removeMovie(list._id, movie._id)
      : this.listApi.addMovie(list._id, { movieId: movie._id });

    request$.subscribe({
      next: apply,
      error: () => this.notificationService.error('Something went wrong. Please try again.'),
    });
  }

  private loadMovie(id: string) {
    this.loading.set(true);
    return this.movieApi.getById(id).pipe(
      switchMap((movie) => {
        this.movie.set(movie);
        return forkJoin({
          watchlist: this.listApi.getWatchlist(),
          favorites: this.listApi.getFavorites(),
          lists: this.listApi.getAll(),
        });
      }),
      tap(({ watchlist, favorites, lists }) => {
        this.watchlist.set(watchlist);
        this.favorites.set(favorites);
        this.customLists.set(lists.filter((list) => list.type === EListType.CUSTOM));
      }),
      map(() => undefined),
      catchError(() => {
        this.movie.set(null);
        this.notificationService.error('Failed to load movie details.');
        return of(undefined);
      }),
      finalize(() => this.loading.set(false)),
    );
  }
}
