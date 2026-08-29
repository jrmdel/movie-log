import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { of } from 'rxjs';
import { catchError, finalize } from 'rxjs/operators';

import { HistoryApiService } from '@src/app/core/api/history-api.service';
import { ESortOrder, IHistoryWithMovie, IUpdateHistory } from '@src/app/core/models/history.model';
import { NotificationService } from '@src/app/core/services/notification.service';
import { ConfirmDialog } from '@src/app/shared/components/confirm-dialog/confirm-dialog';
import { HistoryEntryRow } from '@src/app/features/history/history-entry-row/history-entry-row';

const HISTORY_PAGE_SIZE = 100;

@Component({
  selector: 'app-history',
  imports: [ConfirmDialog, HistoryEntryRow],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <h1 class="text-2xl font-semibold text-gray-900 dark:text-white">Watch history</h1>

    @if (loading()) {
      <p class="mt-4 text-sm text-gray-500 dark:text-gray-400">Loading…</p>
    } @else if (rows().length === 0) {
      <p class="mt-4 text-sm text-gray-500 dark:text-gray-400">
        You haven't logged any movies yet.
      </p>
    } @else {
      <ul
        class="mt-4 divide-y divide-gray-200 rounded-md border border-gray-200 bg-white dark:divide-gray-700/60 dark:border-gray-700 dark:bg-gray-800/40"
      >
        @for (row of rows(); track row._id) {
          <li class="flex flex-col gap-3 px-4 py-3 sm:flex-row sm:items-start sm:justify-between">
            <app-history-entry-row
              [entry]="row"
              [editing]="editingId() === row._id"
              (edit)="editingId.set(row._id)"
              (cancel)="editingId.set(null)"
              (save)="saveEdit(row, $event)"
              (delete)="entryPendingDeletion.set(row)"
            />
          </li>
        }
      </ul>
    }

    <app-confirm-dialog
      [open]="entryPendingDeletion() !== null"
      title="Delete entry"
      [message]="deleteMessage()"
      confirmLabel="Delete"
      (confirm)="deleteConfirmed()"
      (cancel)="entryPendingDeletion.set(null)"
    />
  `,
})
export class History {
  private readonly historyApi = inject(HistoryApiService);
  private readonly notificationService = inject(NotificationService);

  protected readonly loading = signal(true);
  protected readonly rows = signal<IHistoryWithMovie[]>([]);
  protected readonly entryPendingDeletion = signal<IHistoryWithMovie | null>(null);
  protected readonly deleteMessage = computed(
    () =>
      `Remove "${this.entryPendingDeletion()?.movie.title ?? 'this movie'}" from your history? This cannot be undone.`,
  );

  protected readonly editingId = signal<string | null>(null);

  constructor() {
    this.historyApi
      .getAllWithMovies({ limit: HISTORY_PAGE_SIZE, sortOrder: ESortOrder.DESC })
      .pipe(
        catchError(() => {
          this.notificationService.error('Failed to load your watch history.');
          return of<IHistoryWithMovie[]>([]);
        }),
        finalize(() => this.loading.set(false)),
        takeUntilDestroyed(),
      )
      .subscribe((rows) => this.rows.set(rows));
  }

  protected saveEdit(row: IHistoryWithMovie, draft: IUpdateHistory): void {
    this.historyApi.update(row._id, draft).subscribe({
      next: (updated) => {
        this.rows.update((rows) =>
          rows.map((current) =>
            current._id === updated._id ? { ...current, ...updated } : current,
          ),
        );
        this.editingId.set(null);
      },
      error: () => this.notificationService.error('Failed to update this entry.'),
    });
  }

  protected deleteConfirmed(): void {
    const entry = this.entryPendingDeletion();
    if (!entry) {
      return;
    }

    this.historyApi.remove(entry._id).subscribe({
      next: () => {
        this.rows.update((rows) => rows.filter((row) => row._id !== entry._id));
        this.entryPendingDeletion.set(null);
      },
      error: () => {
        this.notificationService.error('Failed to delete this entry.');
        this.entryPendingDeletion.set(null);
      },
    });
  }
}
