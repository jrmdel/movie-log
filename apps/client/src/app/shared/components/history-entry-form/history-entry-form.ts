import { ChangeDetectionStrategy, Component, computed, input, model, output } from '@angular/core';

import { RatingStars } from '@src/app/shared/components/rating-stars/rating-stars';

let nextFormId = 0;

// Date/rating/notes fields shared by the "log as watched" and history-edit forms.
@Component({
  selector: 'app-history-entry-form',
  imports: [RatingStars],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div [class]="compact() ? 'flex flex-col gap-2' : 'flex flex-col gap-3'">
      <div [class.mt-3]="!compact()">
        <label
          [for]="viewedAtId"
          class="block text-xs font-medium text-gray-600 dark:text-gray-400"
        >
          Date watched
        </label>
        <input
          [id]="viewedAtId"
          type="date"
          [value]="viewedAt()"
          (input)="viewedAt.set($any($event.target).value)"
          class="mt-1 w-full rounded-md border border-gray-300 bg-white px-3 py-1.5 text-sm text-gray-900 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 dark:border-gray-700 dark:bg-gray-800 dark:text-white dark:scheme-dark dark:focus:border-indigo-400 dark:focus:ring-indigo-400"
        />
      </div>

      <div [class.mt-3]="!compact()">
        <span class="block text-xs font-medium text-gray-600 dark:text-gray-400">Rating</span>
        <app-rating-stars [value]="rating()" (valueChange)="rating.set($event)" />
      </div>

      <div [class.mt-3]="!compact()">
        <label [for]="notesId" class="block text-xs font-medium text-gray-600 dark:text-gray-400">
          Notes
        </label>
        <textarea
          [id]="notesId"
          rows="2"
          [value]="notes()"
          (input)="notes.set($any($event.target).value)"
          class="mt-1 w-full rounded-md border border-gray-300 bg-white px-3 py-1.5 text-sm text-gray-900 placeholder-gray-400 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 dark:border-gray-700 dark:bg-gray-800 dark:text-white dark:placeholder-gray-500 dark:focus:border-indigo-400 dark:focus:ring-indigo-400"
        ></textarea>
      </div>

      <div [class]="compact() ? 'flex gap-2' : 'mt-4 flex'">
        <button type="button" [disabled]="saving()" (click)="save.emit()" [class]="buttonClass()">
          {{ saving() ? 'Saving…' : saveLabel() }}
        </button>
        @if (showCancel()) {
          <button
            type="button"
            class="rounded-md px-3 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800"
            (click)="cancel.emit()"
          >
            Cancel
          </button>
        }
      </div>
    </div>
  `,
})
export class HistoryEntryForm {
  readonly viewedAt = model('');
  readonly rating = model(0);
  readonly notes = model('');

  readonly saveLabel = input('Save');
  readonly saving = input(false);
  readonly compact = input(false);
  readonly showCancel = input(false);

  readonly save = output<void>();
  readonly cancel = output<void>();

  protected readonly viewedAtId = `history-entry-viewed-at-${nextFormId}`;
  protected readonly notesId = `history-entry-notes-${nextFormId++}`;

  protected readonly buttonClass = computed(() =>
    this.compact()
      ? 'rounded-md bg-indigo-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-indigo-700'
      : 'w-full rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-50',
  );
}
