
import { Manager, Notifications, NotificationType } from '@twilio/flex-ui';

import { FlexNotification } from '../enums';

const manager = Manager.getInstance();

export const registerNotifications = () => {
  // These notifications let the user know the queue they're trying to
  // transfer to is currently closed, along with the hours of operation
  // for the target queue
  manager.strings[FlexNotification.transferQueueClosed] = (`
    Queue [{{queueName}}] is closed. Queue hours are:
    <hr>
    <p>{{breakLines queueHours}}</p>
  `);
  manager.strings[FlexNotification.transferQueueHoliday] = (`
    Queue [{{queueName}}] is closed today for a holiday. Queue hours are:
    <hr>
    <p>{{breakLines queueHours}}</p>
  `);

  const queueClosedNotificationTimeoutMs = 20000;

  Notifications.registerNotification({
    id: FlexNotification.transferQueueClosed,
    closeButton: true,
    content: FlexNotification.transferQueueClosed,
    timeout: queueClosedNotificationTimeoutMs,
    type: NotificationType.warning
  });
  Notifications.registerNotification({
    id: FlexNotification.transferQueueHoliday,
    closeButton: true,
    content: FlexNotification.transferQueueHoliday,
    timeout: queueClosedNotificationTimeoutMs,
    type: NotificationType.warning
  });
}
