import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ListApiService } from '@src/app/core/api/list-api.service';
import { MovieApiService } from '@src/app/core/api/movie-api.service';
import { EListType, IListDocument } from '@src/app/core/models/list.model';
import { IMovieDocument } from '@src/app/core/models/movie.model';
import { NotificationService } from '@src/app/core/services/notification.service';
import { MovieListItem } from '@src/app/features/lists/components/movie-list-item/movie-list-item';
import { ConfirmDialog } from '@src/app/shared/components/confirm-dialog/confirm-dialog';
import { minDurationSignal } from '@src/app/shared/tools/signals/signals.tools';
import { of } from 'rxjs';
import { catchError, filter, finalize, map, switchMap, take, tap } from 'rxjs/operators';

@Component({
  selector: 'app-list-detail',
  imports: [ReactiveFormsModule, MovieListItem, ConfirmDialog],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @if (loading()) {
      <p class="text-sm text-gray-500 dark:text-gray-400">Loading…</p>
    } @else if (list(); as list) {
      <div class="flex items-center justify-between">
        <h1 class="text-2xl font-semibold text-gray-900 dark:text-white">{{ list.name }}</h1>
        @if (isCustom()) {
          <button
            type="button"
            class="text-sm font-medium text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
            (click)="confirmDeleteOpen.set(true)"
          >
            Delete list
          </button>
        }
      </div>

      @if (isCustom()) {
        <form class="mt-4 flex max-w-md flex-col gap-2" [formGroup]="form" (ngSubmit)="save()">
          <input
            type="text"
            formControlName="name"
            placeholder="Name"
            class="rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 placeholder-gray-400 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 dark:border-gray-700 dark:bg-gray-800 dark:text-white dark:placeholder-gray-500 dark:focus:border-indigo-400 dark:focus:ring-indigo-400"
          />
          <textarea
            formControlName="description"
            placeholder="Description (optional)"
            rows="2"
            class="rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 placeholder-gray-400 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 dark:border-gray-700 dark:bg-gray-800 dark:text-white dark:placeholder-gray-500 dark:focus:border-indigo-400 dark:focus:ring-indigo-400"
          ></textarea>
          <button
            type="submit"
            [disabled]="form.invalid || showSaving()"
            class="self-start rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-indigo-500 dark:hover:bg-indigo-600"
          >
            {{ showSaving() ? 'Saving…' : 'Save changes' }}
          </button>
        </form>
      }

      @if (movies().length === 0) {
        <p class="mt-6 text-sm text-gray-500 dark:text-gray-400">No movies in this list yet.</p>
      } @else {
        <div class="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-5">
          @for (movie of movies(); track movie._id) {
            <app-movie-list-item [movie]="movie" (removeMovie)="removeMovie($event)" />
          }
        </div>
      }

      <app-confirm-dialog
        [open]="confirmDeleteOpen()"
        title="Delete list"
        [message]="deleteMessage()"
        confirmLabel="Delete"
        (confirm)="deleteList()"
        (cancel)="confirmDeleteOpen.set(false)"
      />
    } @else {
      <p class="text-sm text-gray-500 dark:text-gray-400">List not found.</p>
    }
  `,
})
export class ListDetail {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly listApi = inject(ListApiService);
  private readonly movieApi = inject(MovieApiService);
  private readonly notificationService = inject(NotificationService);
  private readonly formBuilder = inject(NonNullableFormBuilder);

  protected readonly loading = signal(true);
  protected readonly list = signal<IListDocument | null>(null);
  protected readonly movies = signal<IMovieDocument[]>([]);
  protected readonly saving = signal(false);
  protected readonly showSaving = minDurationSignal(this.saving, 400);
  protected readonly confirmDeleteOpen = signal(false);

  protected readonly isCustom = computed(() => this.list()?.type === EListType.CUSTOM);
  protected readonly deleteMessage = computed(
    () => `Delete "${this.list()?.name ?? ''}"? This cannot be undone.`,
  );

  protected readonly form = this.formBuilder.group({
    name: ['', Validators.required],
    description: [''],
  });

  constructor() {
    this.route.paramMap
      .pipe(
        map((params) => params.get('id')),
        filter((id): id is string => !!id),
        switchMap((id) => this.loadList(id)),
        take(1),
      )
      .subscribe();
  }

  protected save(): void {
    const list = this.list();
    if (!list || this.form.invalid || this.saving()) {
      return;
    }

    this.saving.set(true);
    this.listApi.update(list._id, this.form.getRawValue()).subscribe({
      next: (updated) => {
        this.saving.set(false);
        this.list.set(updated);
        this.notificationService.success('List updated.');
      },
      error: () => {
        this.saving.set(false);
        this.notificationService.error('Failed to update list.');
      },
    });
  }

  protected removeMovie(movieId: string): void {
    const list = this.list();
    if (!list) {
      return;
    }

    this.listApi.removeMovie(list._id, movieId).subscribe({
      next: (updated) => {
        this.list.set(updated);
        this.movies.update((movies) => movies.filter((current) => current._id !== movieId));
      },
      error: () => this.notificationService.error('Failed to remove movie.'),
    });
  }

  protected deleteList(): void {
    const list = this.list();
    if (!list) {
      return;
    }

    this.listApi.remove(list._id).subscribe({
      next: () => void this.router.navigateByUrl('/lists'),
      error: () => {
        this.confirmDeleteOpen.set(false);
        this.notificationService.error('Failed to delete list.');
      },
    });
  }

  private loadList(id: string) {
    this.loading.set(true);
    return this.listApi.getById(id).pipe(
      tap((list) => {
        this.list.set(list);
        this.form.setValue({ name: list.name, description: list.description ?? '' });
      }),
      switchMap((list) => this.movieApi.getManyById(list.movieIds)),
      tap((movies) => this.movies.set(movies)),
      catchError(() => {
        this.list.set(null);
        this.notificationService.error('Failed to load this list.');
        return of(undefined);
      }),
      finalize(() => this.loading.set(false)),
      take(1),
    );
  }
}
