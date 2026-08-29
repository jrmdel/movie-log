import { DatePipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, effect, input, output, signal } from '@angular/core';
import { RouterLink } from '@angular/router';

import { IUpdateHistory, IHistoryWithMovie } from '@src/app/core/models/history.model';
import { HistoryEntryForm } from '@src/app/shared/components/history-entry-form/history-entry-form';
import { RatingStars } from '@src/app/shared/components/rating-stars/rating-stars';

function toDateInputValue(value: Date | string | undefined): string {
  return value ? new Date(value).toISOString().slice(0, 10) : '';
}

// Renders as a flex item pair (display: contents) so it can sit directly inside the parent <li>.
@Component({
  selector: 'app-history-entry-row',
  imports: [DatePipe, RatingStars, RouterLink, HistoryEntryForm],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { style: 'display: contents' },
  template: `
    <div class="min-w-0 flex-1">
      <a
        [routerLink]="['/movies', entry().movie.externalId]"
        class="truncate font-medium text-gray-900 hover:text-indigo-600 dark:text-gray-100 dark:hover:text-indigo-400"
      >
        {{ entry().movie.title }} ({{ entry().movie.year }})
      </a>

      @if (editing()) {
        <div class="mt-2 max-w-sm">
          <app-history-entry-form
            [(viewedAt)]="draftViewedAt"
            [(rating)]="draftRating"
            [(notes)]="draftNotes"
            [compact]="true"
            [showCancel]="true"
            (save)="save.emit(draft())"
            (cancel)="cancel.emit()"
          />
        </div>
      } @else {
        <div
          class="mt-1 flex flex-wrap items-center gap-3 text-sm text-gray-500 dark:text-gray-400"
        >
          @if (entry().viewedAt) {
            <span>{{ entry().viewedAt | date: 'mediumDate' }}</span>
          }
          @if (entry().rating) {
            <app-rating-stars [value]="entry().rating!" [readonly]="true" />
          }
        </div>
        @if (entry().notes) {
          <p class="mt-1 text-sm text-gray-600 dark:text-gray-300">{{ entry().notes }}</p>
        }
      }
    </div>

    @if (!editing()) {
      <div class="flex shrink-0 gap-3">
        <button
          type="button"
          class="text-sm font-medium text-indigo-600 hover:text-indigo-700 dark:text-indigo-400 dark:hover:text-indigo-300"
          (click)="edit.emit()"
        >
          Edit
        </button>
        <button
          type="button"
          class="text-sm font-medium text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
          (click)="delete.emit()"
        >
          Delete
        </button>
      </div>
    }
  `,
})
export class HistoryEntryRow {
  readonly entry = input.required<IHistoryWithMovie>();
  readonly editing = input(false);

  readonly edit = output<void>();
  readonly cancel = output<void>();
  readonly delete = output<void>();
  readonly save = output<IUpdateHistory>();

  protected readonly draftViewedAt = signal('');
  protected readonly draftRating = signal(0);
  protected readonly draftNotes = signal('');

  constructor() {
    // Resets the draft fields from the entry whenever the row switches into edit mode.
    effect(() => {
      if (!this.editing()) {
        return;
      }
      const entry = this.entry();
      this.draftViewedAt.set(toDateInputValue(entry.viewedAt));
      this.draftRating.set(entry.rating ?? 0);
      this.draftNotes.set(entry.notes ?? '');
    });
  }

  protected draft(): IUpdateHistory {
    return {
      viewedAt: this.draftViewedAt() || undefined,
      rating: this.draftRating() || undefined,
      notes: this.draftNotes().trim() || undefined,
    };
  }
}
