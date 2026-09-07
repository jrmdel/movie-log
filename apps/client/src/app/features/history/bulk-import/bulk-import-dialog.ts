import {
  ChangeDetectionStrategy,
  Component,
  effect,
  inject,
  input,
  output,
  signal,
  viewChild,
} from '@angular/core';
import { NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';

import { BulkImportApiService } from '@src/app/core/api/bulk-import-api.service';
import { NotificationService } from '@src/app/core/services/notification.service';
import { parseBulkImportInput } from '@src/app/shared/tools/bulk-import/bulk-import.tools';

const EXAMPLE_JSON = `[
  { "imdbId": "tt0111161", "viewDate": "2024-03-02" },
  { "title": "Interstellar", "year": 2014 }
]`;

@Component({
  selector: 'app-bulk-import-dialog',
  imports: [ReactiveFormsModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    '(keydown.escape)': 'cancel()',
  },
  template: `
    @if (open()) {
      <div
        class="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4"
        (click)="cancel()"
      >
        <div
          class="w-full max-w-lg rounded-lg bg-white p-6 shadow-lg dark:bg-gray-800"
          role="dialog"
          aria-modal="true"
          [attr.aria-labelledby]="titleId"
          (click)="$event.stopPropagation()"
        >
          <h2 [id]="titleId" class="text-lg font-semibold text-gray-900 dark:text-white">
            Import watch history
          </h2>
          <p class="mt-2 text-sm text-gray-600 dark:text-gray-400">
            Paste a JSON array of movies. Each item needs a <code>title</code>, and may include an
            <code>imdbId</code>, <code>year</code> and <code>viewDate</code>.
          </p>

          <form [formGroup]="form" (ngSubmit)="submit()">
            <label [for]="jsonFieldId" class="sr-only">Movies JSON</label>
            <textarea
              #jsonField
              [id]="jsonFieldId"
              formControlName="json"
              rows="8"
              [placeholder]="examplePlaceholder"
              class="mt-4 w-full rounded-md border border-gray-300 p-2 font-mono text-xs text-gray-900 focus:border-indigo-500 focus:ring-indigo-500 dark:border-gray-600 dark:bg-gray-900 dark:text-gray-100"
              [attr.aria-invalid]="errors().length > 0"
              [attr.aria-describedby]="errors().length > 0 ? errorsId : null"
            ></textarea>

            @if (errors().length > 0) {
              <ul
                [id]="errorsId"
                class="mt-2 list-disc space-y-1 pl-5 text-sm text-red-600 dark:text-red-400"
              >
                @for (error of errors(); track error) {
                  <li>{{ error }}</li>
                }
              </ul>
            }

            <div class="mt-6 flex justify-end gap-3">
              <button
                type="button"
                class="rounded-md px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700"
                (click)="cancel()"
              >
                Cancel
              </button>
              <button
                type="submit"
                [disabled]="submitting()"
                class="rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 disabled:opacity-50"
              >
                {{ submitting() ? 'Starting…' : 'Start import' }}
              </button>
            </div>
          </form>
        </div>
      </div>
    }
  `,
})
export class BulkImportDialog {
  readonly open = input(false);
  readonly cancelled = output<void>();

  private readonly formBuilder = inject(NonNullableFormBuilder);
  private readonly bulkImportApi = inject(BulkImportApiService);
  private readonly notificationService = inject(NotificationService);

  protected readonly titleId = 'bulk-import-dialog-title';
  protected readonly jsonFieldId = 'bulk-import-dialog-json';
  protected readonly errorsId = 'bulk-import-dialog-errors';
  protected readonly examplePlaceholder = EXAMPLE_JSON;

  protected readonly form = this.formBuilder.group({
    json: ['', Validators.required],
  });
  protected readonly errors = signal<string[]>([]);
  protected readonly submitting = signal(false);

  private readonly jsonField = viewChild<{ nativeElement: HTMLTextAreaElement }>('jsonField');

  constructor() {
    effect(() => {
      if (this.open()) {
        this.jsonField()?.nativeElement.focus();
      }
    });
  }

  protected submit(): void {
    if (this.submitting()) {
      return;
    }

    const result = parseBulkImportInput(this.form.getRawValue().json);
    if (!result.valid) {
      this.errors.set(result.errors);
      return;
    }

    this.errors.set([]);
    this.submitting.set(true);
    this.bulkImportApi.create(result.rows).subscribe({
      next: () => {
        this.submitting.set(false);
        this.notificationService.success(`Import started for ${result.rows.length} movie(s).`);
        this.reset();
        this.cancelled.emit();
      },
      error: () => {
        this.submitting.set(false);
        this.notificationService.error('Failed to start the import.');
      },
    });
  }

  protected cancel(): void {
    this.reset();
    this.cancelled.emit();
  }

  private reset(): void {
    this.form.reset();
    this.errors.set([]);
  }
}
