
import { Manager, Notifications, NotificationType } from '@twilio/flex-ui';

import { FlexNotification } from '../enums';

const manager = Manager.getInstance();

export const registerNotifications = () => {
  manager.strings[FlexNotification.transferQueueClosed] = (
    "Queue [{{queueName}}] is closed. " +
    "Queue open hours are {{queueOpenHour}} to {{queueCloseHour}} {{timezoneName}}."
  );
  manager.strings[FlexNotification.transferQueueHoliday] = (
    "Queue [{{queueName}}] is closed today for a holiday. " +
    "Queue open hours are {{queueOpenHour}} to {{queueCloseHour}} {{timezoneName}}."
  );

  Notifications.registerNotification({
    id: FlexNotification.transferQueueClosed,
    closeButton: true,
    content: FlexNotification.transferQueueClosed,
    timeout: 20000,
    type: NotificationType.warning
  });
  Notifications.registerNotification({
    id: FlexNotification.transferQueueHoliday,
    closeButton: true,
    content: FlexNotification.transferQueueHoliday,
    timeout: 20000,
    type: NotificationType.warning
  });
}
