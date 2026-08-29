import { ChangeDetectionStrategy, Component, computed, input, output } from '@angular/core';

const STAR_VALUES = [1, 2, 3, 4, 5];

@Component({
  selector: 'app-rating-stars',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="inline-flex items-center gap-0.5" role="img" [attr.aria-label]="ariaLabel()">
      @for (star of stars; track star) {
        @if (readonly()) {
          <span
            class="text-lg"
            [class.text-amber-500]="star <= value()"
            [class.text-gray-300]="star > value()"
            >★</span
          >
        } @else {
          <button
            type="button"
            class="text-lg text-amber-500"
            [class.text-gray-300]="star > value()"
            [attr.aria-label]="'Rate ' + star + ' out of ' + stars.length"
            (click)="valueChange.emit(star)"
          >
            ★
          </button>
        }
      }
    </div>
  `,
})
export class RatingStars {
  protected readonly stars = STAR_VALUES;

  readonly value = input(0);
  readonly readonly = input(false);
  readonly valueChange = output<number>();

  protected readonly ariaLabel = computed(
    () => `Rating: ${this.value()} out of ${this.stars.length} stars`,
  );
}
