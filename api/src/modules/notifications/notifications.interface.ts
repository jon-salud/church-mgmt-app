export interface INotificationSender {
  sendNotification(userId: string, payload: unknown): Promise<void>;
}

export const NOTIFICATION_SENDER = Symbol('NOTIFICATION_SENDER');
