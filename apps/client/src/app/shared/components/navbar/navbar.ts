import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { Subject, of } from 'rxjs';
import { catchError, debounceTime, distinctUntilChanged, switchMap } from 'rxjs/operators';

import { MovieApiService } from '@src/app/core/api/movie-api.service';
import { AuthService } from '@src/app/core/auth/auth.service';
import { IMovie } from '@src/app/core/models/movie.model';

const SEARCH_DEBOUNCE_MS = 500;
const MIN_SEARCH_LENGTH = 2;
const PREVIEW_IMAGE_SUFFIX = '_QL75_UX100.jpg';

@Component({
  selector: 'app-navbar',
  imports: [RouterLink, RouterLinkActive],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <header
      class="sticky top-0 z-40 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900"
    >
      <div class="mx-auto flex max-w-5xl items-center gap-4 px-4 py-3">
        <a routerLink="/" class="text-lg font-semibold text-indigo-600 dark:text-indigo-400">
          Movie Log
        </a>

        <div class="relative max-w-md flex-1">
          <input
            type="search"
            placeholder="Search movies…"
            [value]="searchTerm()"
            (input)="onSearchInput($event)"
            (keydown.escape)="closeSuggestions()"
            (keydown.enter)="selectFirstSuggestion()"
            autocomplete="off"
            role="combobox"
            aria-autocomplete="list"
            aria-label="Search movies"
            [attr.aria-expanded]="suggestions().length > 0"
            class="w-full rounded-md border border-gray-300 dark:border-gray-500 dark:text-white px-3 py-1.5 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
          />
          @if (suggestions().length > 0) {
            <ul
              role="listbox"
              class="absolute z-50 mt-1 max-h-80 w-full overflow-auto rounded-md border border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-800 shadow-lg"
            >
              @for (movie of suggestions(); track movie.externalId) {
                <li role="option">
                  <button
                    type="button"
                    class="flex w-full items-center gap-2 px-3 py-2 text-left text-sm hover:bg-gray-50 dark:hover:bg-gray-700"
                    (click)="selectMovie(movie)"
                  >
                    @if (getPreviewUrl(movie); as previewUrl) {
                      <img
                        [src]="previewUrl"
                        alt=""
                        loading="lazy"
                        class="h-12 w-8 shrink-0 rounded object-cover"
                      />
                    } @else {
                      <div class="h-12 w-8 shrink-0 rounded bg-gray-200"></div>
                    }
                    <span class="flex flex-1 items-center justify-between gap-2 truncate">
                      <span class="truncate dark:text-white">{{ movie.title }}</span>
                      <span class="text-gray-400">{{ movie.year }}</span>
                    </span>
                  </button>
                </li>
              }
            </ul>
          }
        </div>

        <nav
          class="hidden items-center gap-4 text-sm font-medium text-gray-700 dark:text-gray-300 md:flex"
        >
          <a routerLink="/watchlist" routerLinkActive="text-indigo-600 dark:text-indigo-400">
            Watchlist
          </a>
          <a routerLink="/favorites" routerLinkActive="text-indigo-600 dark:text-indigo-400">
            Favorites
          </a>
          <a routerLink="/lists" routerLinkActive="text-indigo-600 dark:text-indigo-400"> Lists </a>
          <a routerLink="/history" routerLinkActive="text-indigo-600 dark:text-indigo-400">
            History
          </a>
          <a routerLink="/profile" routerLinkActive="text-indigo-600 dark:text-indigo-400">
            Profile
          </a>
          <button
            type="button"
            class="rounded-md bg-gray-100 dark:bg-gray-700 px-3 py-1.5 hover:bg-gray-200 dark:hover:bg-gray-600"
            (click)="logout()"
          >
            Log out
          </button>
        </nav>

        <button
          type="button"
          class="rounded-md px-2 py-1 text-xl md:hidden"
          (click)="mobileMenuOpen.set(!mobileMenuOpen())"
          [attr.aria-expanded]="mobileMenuOpen()"
          aria-label="Toggle menu"
        >
          ☰
        </button>
      </div>

      @if (mobileMenuOpen()) {
        <nav
          class="flex flex-col gap-1 border-t border-gray-200 px-4 py-2 text-sm font-medium text-gray-700 md:hidden"
        >
          <a routerLink="/watchlist" (click)="mobileMenuOpen.set(false)">Watchlist</a>
          <a routerLink="/favorites" (click)="mobileMenuOpen.set(false)">Favorites</a>
          <a routerLink="/lists" (click)="mobileMenuOpen.set(false)">Lists</a>
          <a routerLink="/history" (click)="mobileMenuOpen.set(false)">History</a>
          <a routerLink="/profile" (click)="mobileMenuOpen.set(false)">Profile</a>
          <button type="button" class="py-1 text-left" (click)="logout()">Log out</button>
        </nav>
      }
    </header>
  `,
})
export class Navbar {
  private readonly movieApi = inject(MovieApiService);
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);

  protected readonly searchTerm = signal('');
  protected readonly suggestions = signal<IMovie[]>([]);
  protected readonly mobileMenuOpen = signal(false);

  private readonly searchTerms$ = new Subject<string>();

  constructor() {
    this.searchTerms$
      .pipe(
        debounceTime(SEARCH_DEBOUNCE_MS),
        distinctUntilChanged(),
        switchMap((term) => {
          if (term.trim().length < MIN_SEARCH_LENGTH) {
            return of<IMovie[]>([]);
          }
          return this.movieApi.search(term).pipe(catchError(() => of<IMovie[]>([])));
        }),
        takeUntilDestroyed(),
      )
      .subscribe((results) => this.suggestions.set(results));
  }

  protected onSearchInput(event: Event): void {
    const value = (event.target as HTMLInputElement).value;
    this.searchTerm.set(value);
    this.searchTerms$.next(value);
  }

  protected closeSuggestions(): void {
    this.suggestions.set([]);
  }

  protected getPreviewUrl(movie: IMovie): string | undefined {
    return movie.url?.replace(/\.jpg$/, PREVIEW_IMAGE_SUFFIX);
  }

  protected selectFirstSuggestion(): void {
    const [first] = this.suggestions();
    if (first) {
      this.selectMovie(first);
    }
  }

  protected selectMovie(movie: IMovie): void {
    this.searchTerm.set('');
    this.suggestions.set([]);
    void this.router.navigate(['/movies', movie.externalId]);
  }

  protected logout(): void {
    this.authService.logout().subscribe(() => void this.router.navigateByUrl('/login'));
  }
}
