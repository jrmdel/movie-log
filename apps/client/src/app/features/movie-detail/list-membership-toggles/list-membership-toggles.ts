import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';

import { IListDocument } from '@src/app/core/models/list.model';

export interface ICustomListToggle {
  list: IListDocument;
  active: boolean;
}

@Component({
  selector: 'app-list-membership-toggles',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="mt-6 flex flex-wrap gap-3">
      <!-- Bouton Watchlist -->
      <button
        type="button"
        class="rounded-md border px-4 py-2 text-sm font-medium transition-colors"
        [class]="buttonClass(inWatchlist())"
        (click)="toggleWatchlist.emit()"
      >
        {{ inWatchlist() ? '✓ In Watchlist' : '+ Add to Watchlist' }}
      </button>

      <!-- Bouton Favorites -->
      <button
        type="button"
        class="rounded-md border px-4 py-2 text-sm font-medium transition-colors"
        [class]="buttonClass(inFavorites())"
        (click)="toggleFavorites.emit()"
      >
        {{ inFavorites() ? '✓ In Favorites' : '+ Add to Favorites' }}
      </button>
    </div>

    @if (customLists().length > 0) {
      <div class="mt-4">
        <h2 class="text-sm font-medium text-gray-800 dark:text-gray-200">Add to a list</h2>
        <div class="mt-2 flex flex-wrap gap-2">
          @for (item of customLists(); track item.list._id) {
            <button
              type="button"
              class="rounded-full border px-3 py-1 text-xs font-medium transition-colors"
              [class]="buttonClass(item.active)"
              (click)="toggleCustomList.emit(item.list)"
            >
              {{ item.active ? '✓ ' + item.list.name : '+ ' + item.list.name }}
            </button>
          }
        </div>
      </div>
    }
  `,
})
export class ListMembershipToggles {
  readonly inWatchlist = input.required<boolean>();
  readonly inFavorites = input.required<boolean>();
  readonly customLists = input<ICustomListToggle[]>([]);

  readonly toggleWatchlist = output<void>();
  readonly toggleFavorites = output<void>();
  readonly toggleCustomList = output<IListDocument>();

  protected buttonClass(isActive: boolean): string {
    if (isActive) {
      return 'border-indigo-600 text-indigo-600 dark:border-indigo-400 dark:text-indigo-400 bg-indigo-50/50 dark:bg-indigo-950/30';
    }
    return 'border-gray-300 text-gray-600 hover:bg-gray-50 dark:border-gray-700 dark:text-gray-400 dark:hover:bg-gray-800';
  }
}
