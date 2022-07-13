import { Manager } from '@twilio/flex-ui';

import { queueHoops }  from '../helpers';

const manager = Manager.getInstance();

const registerHandlebarsHelpers = () => {
  window.Handlebars.registerHelper('CustomWorkerDirectoryQueueItemText', (payload) => {
    console.debug('CustomWorkerDirectoryQueueItemText, payload:', payload);
    const queue = payload?.data?.root?.queue;

    if (!queue) {
      return '';
    }

    const queueHoop = queueHoops.getQueueHoopForToday(queue.sid);

    if (!queueHoop) {
      return queue.name;
    }

    return queueHoop.isQueueClosed
      ? `CLOSED: ${queue.name}`
      : queue.name;
  });
};

export const initializeStrings = () => {
  registerHandlebarsHelpers();

  manager.strings.WorkerDirectoryQueueItemText = '{{CustomWorkerDirectoryQueueItemText}}';
};

