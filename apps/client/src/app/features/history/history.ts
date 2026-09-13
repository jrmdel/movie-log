import {
  ChangeDetectionStrategy,
  Component,
  computed,
  effect,
  inject,
  signal,
} from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { of } from 'rxjs';
import { catchError, finalize, take } from 'rxjs/operators';

import { BulkImportApiService } from '@src/app/core/api/bulk-import-api.service';
import { HistoryApiService } from '@src/app/core/api/history-api.service';
import { EBulkImportJobStatus, IBulkImportJob } from '@src/app/core/models/bulk-import.model';
import { IPaginatedResult } from '@src/app/core/models/common.model';
import {
  EHistorySortBy,
  ESortOrder,
  HistorySortBy,
  IHistoryQuery,
  IHistoryWithMovie,
  IUpdateHistory,
  SortOrder,
} from '@src/app/core/models/history.model';
import { NotificationService } from '@src/app/core/services/notification.service';
import { BulkImportDialog } from '@src/app/features/history/bulk-import/bulk-import-dialog';
import { BulkImportReviewDialog } from '@src/app/features/history/bulk-import/bulk-import-review-dialog';
import { HistoryEntryRow } from '@src/app/features/history/history-entry-row/history-entry-row';
import { ConfirmDialog } from '@src/app/shared/components/confirm-dialog/confirm-dialog';
import { Paginator } from '@src/app/shared/components/paginator/paginator';
import { debouncedSignal } from '@src/app/shared/tools/signals/signals.tools';

const HISTORY_PAGE_SIZE = 20;
const SEARCH_DEBOUNCE_MS = 400;
const DEFAULT_SORT_BY: HistorySortBy = EHistorySortBy.VIEWED_AT;
const DEFAULT_SORT_ORDER: SortOrder = ESortOrder.DESC;

function parsePage(value: string | null): number {
  const parsed = Number(value);
  return Number.isInteger(parsed) && parsed > 0 ? parsed : 1;
}

function parseSortBy(value: string | null): HistorySortBy {
  return value && value in EHistorySortBy ? (value as HistorySortBy) : DEFAULT_SORT_BY;
}

function parseSortOrder(value: string | null): SortOrder {
  return value && value in ESortOrder ? (value as SortOrder) : DEFAULT_SORT_ORDER;
}

@Component({
  selector: 'app-history',
  imports: [ConfirmDialog, HistoryEntryRow, BulkImportDialog, BulkImportReviewDialog, Paginator],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="flex items-center justify-between gap-4">
      <div class="flex flex-col gap-1">
        <h1 class="text-2xl font-semibold text-gray-900 dark:text-white">Watch history</h1>
        <p class="text-sm text-gray-500 dark:text-gray-400">
          {{ totalItems() }} movie{{ totalItems() === 1 ? '' : 's' }}
        </p>
      </div>

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

    <div class="mt-4 flex flex-wrap items-center gap-3">
      <input
        type="search"
        placeholder="Search by title…"
        [value]="searchTermRaw()"
        (input)="onSearchInput($event)"
        aria-label="Search history by movie title"
        class="w-full max-w-xs flex-1 rounded-md border border-gray-300 px-3 py-1.5 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 dark:border-gray-600 dark:bg-gray-800 dark:text-white"
      />

      <label class="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300">
        Sort by
        <select
          [value]="sortBy()"
          (change)="onSortByChange($event)"
          aria-label="Sort history by"
          class="rounded-md border border-gray-300 bg-white px-2 py-1.5 text-sm dark:border-gray-600 dark:bg-gray-800 dark:text-white"
        >
          <option [value]="EHistorySortBy.VIEWED_AT">View date</option>
          <option [value]="EHistorySortBy.RELEASE_YEAR">Release year</option>
          <option [value]="EHistorySortBy.TITLE">Title</option>
        </select>
      </label>

      <button
        type="button"
        class="rounded-md border border-gray-300 px-2 py-1.5 text-sm text-gray-600 hover:bg-gray-100 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700"
        [attr.aria-pressed]="sortOrder() === ESortOrder.ASC"
        aria-label="Toggle sort direction"
        (click)="toggleSortOrder()"
      >
        {{ sortOrder() === ESortOrder.ASC ? '↑ Ascending' : '↓ Descending' }}
      </button>
    </div>

    @if (loading()) {
      <p class="mt-4 text-sm text-gray-500 dark:text-gray-400">Loading…</p>
    } @else if (rows().length === 0) {
      <p class="mt-4 text-sm text-gray-500 dark:text-gray-400">
        @if (searchTermRaw()) {
          No history entries match "{{ searchTermRaw() }}".
        } @else {
          You haven't logged any movies yet.
        }
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

      <app-paginator
        [currentPage]="page()"
        [totalPages]="totalPages()"
        (pageChange)="page.set($event)"
      />
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
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);

  protected readonly EHistorySortBy = EHistorySortBy;
  protected readonly ESortOrder = ESortOrder;

  private readonly initialQueryParams = this.route.snapshot.queryParamMap;

  protected readonly loading = signal(true);
  protected readonly rows = signal<IHistoryWithMovie[]>([]);
  protected readonly totalItems = signal(0);
  protected readonly totalPages = computed(() =>
    Math.max(1, Math.ceil(this.totalItems() / HISTORY_PAGE_SIZE)),
  );

  protected readonly searchTermRaw = signal(this.initialQueryParams.get('search') ?? '');
  private readonly searchTerm = debouncedSignal(this.searchTermRaw, SEARCH_DEBOUNCE_MS);
  protected readonly sortBy = signal<HistorySortBy>(
    parseSortBy(this.initialQueryParams.get('sortBy')),
  );
  protected readonly sortOrder = signal<SortOrder>(
    parseSortOrder(this.initialQueryParams.get('sortOrder')),
  );
  protected readonly page = signal(parsePage(this.initialQueryParams.get('page')));

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

  // Tracks the last-applied filters so page only resets to 1 when search/sort actually change (not on every load).
  private previousFilters = {
    search: this.searchTermRaw(),
    sortBy: this.sortBy(),
    sortOrder: this.sortOrder(),
  };

  constructor() {
    this.bulkImportApi.refreshActiveJob();

    effect(() => {
      const job = this.bulkImportApi.activeJob();
      if (job?.status === EBulkImportJobStatus.COMPLETED) {
        this.handleImportCompleted(job);
      }
    });

    effect(() => {
      const search = this.searchTerm();
      const sortBy = this.sortBy();
      const sortOrder = this.sortOrder();
      const changed =
        search !== this.previousFilters.search ||
        sortBy !== this.previousFilters.sortBy ||
        sortOrder !== this.previousFilters.sortOrder;
      this.previousFilters = { search, sortBy, sortOrder };
      if (changed) {
        this.page.set(1);
      }
    });

    effect(() => {
      const query = this.buildQuery();
      this.loadHistory(query);
      this.syncQueryParams(query);
    });
  }

  private buildQuery(): IHistoryQuery {
    return {
      limit: HISTORY_PAGE_SIZE,
      skip: (this.page() - 1) * HISTORY_PAGE_SIZE,
      sortOrder: this.sortOrder(),
      sortBy: this.sortBy(),
      search: this.searchTerm() || undefined,
    };
  }

  private loadHistory(query: IHistoryQuery): void {
    this.loading.set(true);
    this.historyApi
      .getAllWithMovies(query)
      .pipe(
        take(1),
        catchError(() => {
          this.notificationService.error('Failed to load your watch history.');
          return of<IPaginatedResult<IHistoryWithMovie>>({ items: [], total: 0 });
        }),
        finalize(() => this.loading.set(false)),
      )
      .subscribe((result) => {
        this.rows.set(result.items);
        this.totalItems.set(result.total);
      });
  }

  private syncQueryParams(query: IHistoryQuery): void {
    void this.router.navigate([], {
      relativeTo: this.route,
      queryParams: {
        page: this.page() > 1 ? this.page() : null,
        search: query.search ?? null,
        sortBy: this.sortBy() !== DEFAULT_SORT_BY ? this.sortBy() : null,
        sortOrder: this.sortOrder() !== DEFAULT_SORT_ORDER ? this.sortOrder() : null,
      },
      queryParamsHandling: 'merge',
      replaceUrl: true,
    });
  }

  protected onSearchInput(event: Event): void {
    this.searchTermRaw.set((event.target as HTMLInputElement).value);
  }

  protected onSortByChange(event: Event): void {
    this.sortBy.set((event.target as HTMLSelectElement).value as HistorySortBy);
  }

  protected toggleSortOrder(): void {
    this.sortOrder.set(this.sortOrder() === ESortOrder.ASC ? ESortOrder.DESC : ESortOrder.ASC);
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

    if (this.page() === 1) {
      this.loadHistory(this.buildQuery());
    } else {
      this.page.set(1);
    }
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
        this.entryPendingDeletion.set(null);
        if (this.rows().length === 1 && this.page() > 1) {
          this.page.update((current) => current - 1);
        } else {
          this.loadHistory(this.buildQuery());
        }
      },
      error: () => {
        this.notificationService.error('Failed to delete this entry.');
        this.entryPendingDeletion.set(null);
      },
    });
  }
}
