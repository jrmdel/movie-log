import {
  ChangeDetectionStrategy,
  Component,
  effect,
  input,
  output,
  viewChild,
} from '@angular/core';

let nextDialogId = 0;

@Component({
  selector: 'app-confirm-dialog',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    '(keydown.escape)': 'cancel.emit()',
  },
  template: `
    @if (open()) {
      <div
        class="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4"
        (click)="cancel.emit()"
      >
        <div
          class="w-full max-w-sm rounded-lg bg-white p-6 shadow-lg"
          role="alertdialog"
          aria-modal="true"
          [attr.aria-labelledby]="titleId"
          (click)="$event.stopPropagation()"
        >
          <h2 [id]="titleId" class="text-lg font-semibold text-gray-900">{{ title() }}</h2>
          <p class="mt-2 text-sm text-gray-600">{{ message() }}</p>
          <div class="mt-6 flex justify-end gap-3">
            <button
              #cancelButton
              type="button"
              class="rounded-md px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100"
              (click)="cancel.emit()"
            >
              {{ cancelLabel() }}
            </button>
            <button
              type="button"
              class="rounded-md bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700"
              (click)="confirm.emit()"
            >
              {{ confirmLabel() }}
            </button>
          </div>
        </div>
      </div>
    }
  `,
})
export class ConfirmDialog {
  readonly open = input(false);
  readonly title = input('Are you sure?');
  readonly message = input('');
  readonly confirmLabel = input('Confirm');
  readonly cancelLabel = input('Cancel');
  readonly confirm = output<void>();
  readonly cancel = output<void>();

  protected readonly titleId = `confirm-dialog-title-${nextDialogId++}`;

  private readonly cancelButton = viewChild<{ nativeElement: HTMLButtonElement }>('cancelButton');

  constructor() {
    effect(() => {
      if (this.open()) {
        this.cancelButton()?.nativeElement.focus();
      }
    });
  }
}
