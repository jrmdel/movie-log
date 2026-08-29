export enum ENotificationType {
  SUCCESS = 'SUCCESS',
  ERROR = 'ERROR',
}
export type NotificationType = keyof typeof ENotificationType;

export interface INotification {
  id: number;
  message: string;
  type: NotificationType;
}
