import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  input,
  output,
  signal,
} from '@angular/core';

import { BulkImportApiService } from '@src/app/core/api/bulk-import-api.service';
import {
  EBulkImportRowStatus,
  IResolveBulkImportRow,
} from '@src/app/core/models/bulk-import.model';
import { NotificationService } from '@src/app/core/services/notification.service';

@Component({
  selector: 'app-bulk-import-review-dialog',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    '(keydown.escape)': 'close.emit()',
  },
  template: `
    @if (open()) {
      <div
        class="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4"
        (click)="close.emit()"
      >
        <div
          class="max-h-[80vh] w-full max-w-lg overflow-y-auto rounded-lg bg-white p-6 shadow-lg dark:bg-gray-800"
          role="dialog"
          aria-modal="true"
          [attr.aria-labelledby]="titleId"
          (click)="$event.stopPropagation()"
        >
          <h2 [id]="titleId" class="text-lg font-semibold text-gray-900 dark:text-white">
            Review import matches
          </h2>

          @if (reviewRows().length === 0) {
            <p class="mt-6 text-sm text-gray-500 dark:text-gray-400">
              All done — nothing left to review.
            </p>
          } @else {
            <p class="mt-2 text-sm text-gray-600 dark:text-gray-400">
              These titles matched more than one movie. Pick the right one, or skip.
            </p>
            <ul class="mt-4 space-y-4">
              @for (row of reviewRows(); track row._id) {
                <li class="rounded-md border border-gray-200 p-3 dark:border-gray-700">
                  <p class="text-sm font-medium text-gray-900 dark:text-gray-100">
                    {{ row.input.title }}{{ row.input.year ? ' (' + row.input.year + ')' : '' }}
                  </p>
                  <fieldset class="mt-2 space-y-1" [disabled]="resolvingRowId() === row._id">
                    <legend class="sr-only">Candidates for {{ row.input.title }}</legend>
                    @for (candidate of row.candidates; track candidate.externalId) {
                      <label
                        class="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300"
                      >
                        <input
                          type="radio"
                          [name]="'candidate-' + row._id"
                          (change)="resolve(row._id, candidate.externalId)"
                        />
                        {{ candidate.title }}{{ candidate.year ? ' (' + candidate.year + ')' : '' }}
                      </label>
                    }
                  </fieldset>
                  <button
                    type="button"
                    class="mt-2 text-xs font-medium text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                    [disabled]="resolvingRowId() === row._id"
                    (click)="skip(row._id)"
                  >
                    Skip this one
                  </button>
                </li>
              }
            </ul>
          }

          <div class="mt-6 flex justify-end">
            <button
              type="button"
              class="rounded-md px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700"
              (click)="close.emit()"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    }
  `,
})
export class BulkImportReviewDialog {
  readonly open = input(false);
  readonly close = output<void>();

  private readonly bulkImportApi = inject(BulkImportApiService);
  private readonly notificationService = inject(NotificationService);

  protected readonly titleId = 'bulk-import-review-dialog-title';
  protected readonly resolvingRowId = signal<string | null>(null);

  protected readonly reviewRows = computed(() =>
    (this.bulkImportApi.activeJob()?.rows ?? []).filter(
      (row) => row.status === EBulkImportRowStatus.NEEDS_REVIEW,
    ),
  );

  protected resolve(rowId: string, externalId: string): void {
    this.act(rowId, { externalId });
  }

  protected skip(rowId: string): void {
    this.act(rowId, { skip: true });
  }

  private act(rowId: string, dto: IResolveBulkImportRow): void {
    const job = this.bulkImportApi.activeJob();
    if (!job || this.resolvingRowId()) {
      return;
    }

    this.resolvingRowId.set(rowId);
    this.bulkImportApi.resolveRow(job._id, rowId, dto).subscribe({
      next: () => this.resolvingRowId.set(null),
      error: () => {
        this.resolvingRowId.set(null);
        this.notificationService.error('Failed to update this row.');
      },
    });
  }
}
