import {
  ChangeDetectionStrategy,
  Component,
  computed,
  effect,
  inject,
  signal,
} from '@angular/core';
import { of } from 'rxjs';
import { catchError, finalize, take } from 'rxjs/operators';

import { BulkImportApiService } from '@src/app/core/api/bulk-import-api.service';
import { HistoryApiService } from '@src/app/core/api/history-api.service';
import { EBulkImportJobStatus, IBulkImportJob } from '@src/app/core/models/bulk-import.model';
import { ESortOrder, IHistoryWithMovie, IUpdateHistory } from '@src/app/core/models/history.model';
import { NotificationService } from '@src/app/core/services/notification.service';
import { BulkImportDialog } from '@src/app/features/history/bulk-import/bulk-import-dialog';
import { BulkImportReviewDialog } from '@src/app/features/history/bulk-import/bulk-import-review-dialog';
import { HistoryEntryRow } from '@src/app/features/history/history-entry-row/history-entry-row';
import { ConfirmDialog } from '@src/app/shared/components/confirm-dialog/confirm-dialog';

const HISTORY_PAGE_SIZE = 100;

@Component({
  selector: 'app-history',
  imports: [ConfirmDialog, HistoryEntryRow, BulkImportDialog, BulkImportReviewDialog],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="flex items-center justify-between gap-4">
      <h1 class="text-2xl font-semibold text-gray-900 dark:text-white">Watch history</h1>

      @switch (importStatus()) {
        @case ('NEEDS_REVIEW') {
          <button
            type="button"
            class="text-sm font-medium text-amber-600 hover:text-amber-700 dark:text-amber-400"
            (click)="reviewDialogOpen.set(true)"
          >
            Review import ({{ reviewCount() }})
          </button>
        }
        @case ('PROCESSING') {
          <span class="text-sm text-gray-400 dark:text-gray-500">Importing…</span>
        }
        @default {
          <button
            type="button"
            class="text-sm font-medium text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
            (click)="importDialogOpen.set(true)"
          >
            Import
          </button>
        }
      }
    </div>

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

    <app-bulk-import-dialog [open]="importDialogOpen()" (cancelled)="importDialogOpen.set(false)" />
    <app-bulk-import-review-dialog
      [open]="reviewDialogOpen()"
      (close)="reviewDialogOpen.set(false)"
    />
  `,
})
export class History {
  private readonly historyApi = inject(HistoryApiService);
  private readonly bulkImportApi = inject(BulkImportApiService);
  private readonly notificationService = inject(NotificationService);

  protected readonly loading = signal(true);
  protected readonly rows = signal<IHistoryWithMovie[]>([]);
  protected readonly entryPendingDeletion = signal<IHistoryWithMovie | null>(null);
  protected readonly deleteMessage = computed(
    () =>
      `Remove "${this.entryPendingDeletion()?.movie.title ?? 'this movie'}" from your history? This cannot be undone.`,
  );

  protected readonly editingId = signal<string | null>(null);

  protected readonly importDialogOpen = signal(false);
  protected readonly reviewDialogOpen = signal(false);
  protected readonly importStatus = computed(() => this.bulkImportApi.activeJob()?.status ?? null);
  protected readonly reviewCount = computed(
    () =>
      this.bulkImportApi.activeJob()?.rows.filter((row) => row.status === 'NEEDS_REVIEW').length ??
      0,
  );

  constructor() {
    this.loadHistory();
    this.bulkImportApi.refreshActiveJob();

    effect(() => {
      const job = this.bulkImportApi.activeJob();
      if (job?.status === EBulkImportJobStatus.COMPLETED) {
        this.handleImportCompleted(job);
      }
    });
  }

  private loadHistory(): void {
    this.loading.set(true);
    this.historyApi
      .getAllWithMovies({ limit: HISTORY_PAGE_SIZE, sortOrder: ESortOrder.DESC })
      .pipe(
        take(1),
        catchError(() => {
          this.notificationService.error('Failed to load your watch history.');
          return of<IHistoryWithMovie[]>([]);
        }),
        finalize(() => this.loading.set(false)),
      )
      .subscribe((rows) => this.rows.set(rows));
  }

  private handleImportCompleted(job: IBulkImportJob): void {
    const imported = job.rows.filter((row) => row.status === 'IMPORTED').length;
    const skipped = job.rows.filter((row) => row.status === 'SKIPPED').length;
    const failed = job.rows.filter(
      (row) => row.status === 'FAILED' || row.status === 'NOT_FOUND',
    ).length;
    const parts = [`${imported} added`];
    if (failed > 0) {
      parts.push(`${failed} failed`);
    }
    if (skipped > 0) {
      parts.push(`${skipped} skipped`);
    }
    this.notificationService.success(`Import finished: ${parts.join(', ')}.`);
    this.bulkImportApi.clearActiveJob();
    this.loadHistory();
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
