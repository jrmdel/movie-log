import { ChangeDetectionStrategy, Component, computed, input, output } from '@angular/core';

type PageItem = number | 'ellipsis';

@Component({
  selector: 'app-paginator',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @if (totalPages() > 1) {
      <nav aria-label="Pagination" class="mt-4 flex items-center justify-center gap-1">
        <button
          type="button"
          class="rounded-md px-2 py-1.5 text-sm font-medium text-gray-500 hover:bg-gray-100 disabled:opacity-40 disabled:hover:bg-transparent dark:text-gray-400 dark:hover:bg-gray-700"
          [disabled]="currentPage() === 1"
          (click)="goTo(currentPage() - 1)"
          aria-label="Previous page"
        >
          ‹
        </button>

        @for (item of pageItems(); track $index) {
          @if (item === 'ellipsis') {
            <span class="px-2 text-sm text-gray-400 dark:text-gray-500" aria-hidden="true">…</span>
          } @else {
            <button
              type="button"
              class="rounded-md px-3 py-1.5 text-sm font-medium hover:bg-gray-100 dark:hover:bg-gray-700"
              [class.bg-indigo-600]="item === currentPage()"
              [class.text-white]="item === currentPage()"
              [class.hover:bg-indigo-600]="item === currentPage()"
              [class.text-gray-700]="item !== currentPage()"
              [class.dark:text-gray-300]="item !== currentPage()"
              [attr.aria-current]="item === currentPage() ? 'page' : null"
              [attr.aria-label]="'Page ' + item"
              (click)="goTo(item)"
            >
              {{ item }}
            </button>
          }
        }

        <button
          type="button"
          class="rounded-md px-2 py-1.5 text-sm font-medium text-gray-500 hover:bg-gray-100 disabled:opacity-40 disabled:hover:bg-transparent dark:text-gray-400 dark:hover:bg-gray-700"
          [disabled]="currentPage() === totalPages()"
          (click)="goTo(currentPage() + 1)"
          aria-label="Next page"
        >
          ›
        </button>
      </nav>
    }
  `,
})
export class Paginator {
  readonly currentPage = input.required<number>();
  readonly totalPages = input.required<number>();

  readonly pageChange = output<number>();

  // Always shows first/last page plus a window around the current page, collapsing gaps with an ellipsis.
  protected readonly pageItems = computed<PageItem[]>(() => {
    const total = this.totalPages();
    const current = this.currentPage();
    const items: PageItem[] = [1];

    const siblingStart = Math.max(2, current - 1);
    const siblingEnd = Math.min(total - 1, current + 1);

    if (siblingStart > 2) {
      items.push('ellipsis');
    }
    for (let page = siblingStart; page <= siblingEnd; page++) {
      items.push(page);
    }
    if (siblingEnd < total - 1) {
      items.push('ellipsis');
    }
    if (total > 1) {
      items.push(total);
    }

    return items;
  });

  protected goTo(page: number): void {
    if (page < 1 || page > this.totalPages() || page === this.currentPage()) {
      return;
    }
    this.pageChange.emit(page);
  }
}
