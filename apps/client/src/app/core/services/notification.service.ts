import { Injectable, signal } from '@angular/core';

import {
  ENotificationType,
  INotification,
  NotificationType,
} from '@src/app/core/models/notification.model';

const AUTO_DISMISS_MS = 4000;

@Injectable({ providedIn: 'root' })
export class NotificationService {
  private readonly notificationsSignal = signal<INotification[]>([]);
  readonly notifications = this.notificationsSignal.asReadonly();
  private nextId = 0;

  success(message: string): void {
    this.push(message, ENotificationType.SUCCESS);
  }

  error(message: string): void {
    this.push(message, ENotificationType.ERROR);
  }

  dismiss(id: number): void {
    this.notificationsSignal.update((notifications) =>
      notifications.filter((notification) => notification.id !== id),
    );
  }

  private push(message: string, type: NotificationType): void {
    const id = this.nextId++;
    this.notificationsSignal.update((notifications) => [...notifications, { id, message, type }]);
    setTimeout(() => this.dismiss(id), AUTO_DISMISS_MS);
  }
}
