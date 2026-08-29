import { ChangeDetectionStrategy, Component, inject } from '@angular/core';

import { NotificationService } from '@src/app/core/services/notification.service';

@Component({
  selector: 'app-toast',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="fixed bottom-4 right-4 z-50 flex flex-col gap-2">
      @for (notification of notifications(); track notification.id) {
        <div
          role="status"
          class="rounded-md px-4 py-2 text-sm text-white shadow-lg"
          [class.bg-green-600]="notification.type === 'SUCCESS'"
          [class.bg-red-600]="notification.type === 'ERROR'"
        >
          {{ notification.message }}
        </div>
      }
    </div>
  `,
})
export class Toast {
  private readonly notificationService = inject(NotificationService);
  protected readonly notifications = this.notificationService.notifications;
}
