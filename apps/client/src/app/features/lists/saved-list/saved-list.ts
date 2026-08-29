import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ActivatedRoute, Router } from '@angular/router';
import { Observable, of } from 'rxjs';
import { catchError, finalize, switchMap } from 'rxjs/operators';
import { ListApiService } from '@src/app/core/api/list-api.service';
import { MovieApiService } from '@src/app/core/api/movie-api.service';
import { EListType, IListDocument } from '@src/app/core/models/list.model';
import { IMovieDocument } from '@src/app/core/models/movie.model';
import { NotificationService } from '@src/app/core/services/notification.service';
import { MovieListItem } from '@src/app/features/lists/components/movie-list-item/movie-list-item';

type SavedListType = typeof EListType.WATCHLIST | typeof EListType.FAVORITES;

interface ISavedListCopy {
  title: string;
  emptyMessage: string;
  loadErrorMessage: string;
  removeErrorMessage: string;
}

const COPY: Record<SavedListType, ISavedListCopy> = {
  [EListType.WATCHLIST]: {
    title: 'Watchlist',
    emptyMessage: 'Your watchlist is empty. Search for a movie above to add one.',
    loadErrorMessage: 'Failed to load your watchlist.',
    removeErrorMessage: 'Failed to remove movie from your watchlist.',
  },
  [EListType.FAVORITES]: {
    title: 'Favorites',
    emptyMessage: "You haven't added any favorites yet.",
    loadErrorMessage: 'Failed to load your favorites.',
    removeErrorMessage: 'Failed to remove movie from your favorites.',
  },
};

@Component({
  selector: 'app-saved-list',
  imports: [MovieListItem],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <h1 class="text-2xl font-semibold text-gray-900 dark:text-gray-100">{{ copy.title }}</h1>

    @if (loading()) {
      <p class="mt-4 text-sm text-gray-500 dark:text-gray-400">Loading…</p>
    } @else if (movies().length === 0) {
      <p class="mt-4 text-sm text-gray-500 dark:text-gray-400">{{ copy.emptyMessage }}</p>
    } @else {
      <div class="mt-4 grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-5">
        @for (movie of movies(); track movie._id) {
          <app-movie-list-item [movie]="movie" (removeMovie)="removeMovie($event)" />
        }
      </div>
    }
  `,
})
export class SavedList {
  private readonly route = inject(ActivatedRoute);
  private readonly listApi = inject(ListApiService);
  private readonly movieApi = inject(MovieApiService);
  private readonly notificationService = inject(NotificationService);
  private readonly router = inject(Router);

  private readonly listType = this.route.snapshot.data['listType'] as SavedListType;
  protected readonly copy = COPY[this.listType];

  protected readonly loading = signal(true);
  protected readonly movies = signal<IMovieDocument[]>([]);
  private listId = '';

  constructor() {
    this.fetchList()
      .pipe(
        switchMap((list) => {
          this.listId = list._id;
          return this.movieApi.getManyById(list.movieIds);
        }),
        catchError(() => {
          this.notificationService.error(this.copy.loadErrorMessage);
          return of<IMovieDocument[]>([]);
        }),
        finalize(() => this.loading.set(false)),
        takeUntilDestroyed(),
      )
      .subscribe((movies) => this.movies.set(movies));
  }

  protected removeMovie(movieId: string): void {
    this.listApi.removeMovie(this.listId, movieId).subscribe({
      next: () => this.movies.update((movies) => movies.filter((m) => m._id !== movieId)),
      error: () => this.notificationService.error(this.copy.removeErrorMessage),
    });
  }

  protected openMovie(externalId: string): void {
    void this.router.navigate(['/movies', externalId]);
  }

  private fetchList(): Observable<IListDocument> {
    return this.listType === EListType.WATCHLIST
      ? this.listApi.getWatchlist()
      : this.listApi.getFavorites();
  }
}
