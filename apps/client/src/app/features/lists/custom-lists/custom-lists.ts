import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { of } from 'rxjs';
import { catchError, finalize, map, take } from 'rxjs/operators';

import { ListApiService } from '@src/app/core/api/list-api.service';
import { EListType, IListDocument } from '@src/app/core/models/list.model';
import { NotificationService } from '@src/app/core/services/notification.service';
import { ConfirmDialog } from '@src/app/shared/components/confirm-dialog/confirm-dialog';

@Component({
  selector: 'app-custom-lists',
  imports: [ReactiveFormsModule, RouterLink, ConfirmDialog],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <h1 class="text-2xl font-semibold text-gray-900 dark:text-white">My Lists</h1>

    <form class="mt-4 flex max-w-md gap-2" [formGroup]="form" (ngSubmit)="createList()">
      <input
        type="text"
        formControlName="name"
        placeholder="New list name"
        class="flex-1 rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 placeholder-gray-400 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 dark:border-gray-700 dark:bg-gray-800 dark:text-white dark:placeholder-gray-500 dark:focus:border-indigo-400 dark:focus:ring-indigo-400"
      />
      <button
        type="submit"
        [disabled]="form.invalid || creating()"
        class="rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:enabled:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-indigo-500 dark:enabled:hover:bg-indigo-600"
      >
        {{ creating() ? 'Creating…' : 'Create' }}
      </button>
    </form>

    @if (loading()) {
      <p class="mt-4 text-sm text-gray-500 dark:text-gray-400">Loading…</p>
    } @else if (lists().length === 0) {
      <p class="mt-4 text-sm text-gray-500 dark:text-gray-400">
        You don't have any custom lists yet.
      </p>
    } @else {
      <ul
        class="mt-4 divide-y divide-gray-200 rounded-md border border-gray-200 bg-white dark:divide-gray-700/60 dark:border-gray-700 dark:bg-gray-800/40"
      >
        @for (list of lists(); track list._id) {
          <li class="flex items-center justify-between px-4 py-3">
            <a
              [routerLink]="['/lists', list._id]"
              class="font-medium text-gray-900 hover:text-indigo-600 dark:text-gray-100 dark:hover:text-indigo-400"
            >
              {{ list.name }}
              <span class="ml-2 text-sm text-gray-400 dark:text-gray-500"
                >({{ list.movieIds.length }})</span
              >
            </a>
            <button
              type="button"
              class="text-sm font-medium text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
              (click)="listPendingDeletion.set(list)"
            >
              Delete
            </button>
          </li>
        }
      </ul>
    }

    <app-confirm-dialog
      [open]="listPendingDeletion() !== null"
      title="Delete list"
      [message]="deleteMessage()"
      confirmLabel="Delete"
      (confirm)="deleteConfirmed()"
      (cancel)="listPendingDeletion.set(null)"
    />
  `,
})
export class CustomLists {
  private readonly listApi = inject(ListApiService);
  private readonly notificationService = inject(NotificationService);
  private readonly formBuilder = inject(NonNullableFormBuilder);

  protected readonly loading = signal(true);
  protected readonly lists = signal<IListDocument[]>([]);
  protected readonly creating = signal(false);
  protected readonly listPendingDeletion = signal<IListDocument | null>(null);
  protected readonly deleteMessage = computed(
    () => `Delete "${this.listPendingDeletion()?.name ?? ''}"? This cannot be undone.`,
  );

  protected readonly form = this.formBuilder.group({
    name: ['', Validators.required],
  });

  constructor() {
    this.loading.set(true);
    this.listApi
      .getAll()
      .pipe(
        take(1),
        map((lists) => lists.filter((list) => list.type === EListType.CUSTOM)),
        catchError(() => {
          this.notificationService.error('Failed to load your lists.');
          return of<IListDocument[]>([]);
        }),
        finalize(() => this.loading.set(false)),
      )
      .subscribe((lists) => this.lists.set(lists));
  }

  protected createList(): void {
    if (this.form.invalid || this.creating()) {
      return;
    }

    this.creating.set(true);
    this.listApi.create(this.form.getRawValue()).subscribe({
      next: (list) => {
        this.creating.set(false);
        this.form.reset({ name: '' });
        this.lists.update((lists) => [...lists, list]);
      },
      error: () => {
        this.creating.set(false);
        this.notificationService.error('Failed to create list.');
      },
    });
  }

  protected deleteConfirmed(): void {
    const list = this.listPendingDeletion();
    if (!list) {
      return;
    }

    this.listApi.remove(list._id).subscribe({
      next: () => {
        this.lists.update((lists) => lists.filter((current) => current._id !== list._id));
        this.listPendingDeletion.set(null);
      },
      error: () => {
        this.notificationService.error('Failed to delete list.');
        this.listPendingDeletion.set(null);
      },
    });
  }
}
