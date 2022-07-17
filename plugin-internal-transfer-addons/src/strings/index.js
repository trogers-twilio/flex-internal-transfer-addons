import { Manager } from '@twilio/flex-ui';

import { queueHoops }  from '../helpers';

const manager = Manager.getInstance();

const registerHandlebarsHelpers = () => {
  window.Handlebars.registerHelper('WorkerDirectoryIsQueueClosed', function (payload, options) {
    const queueSid = payload?.sid
    const fnTrue = options?.fn;
    const fnFalse = options?.inverse;

    if (!queueSid) {
      return fnFalse(this);
    }

    const queueHoop = queueHoops.getQueueHoopForToday(queueSid);

    if (!queueHoop) {
      return fnFalse(this);
    }

    const response = {
      ...this,
      queueOpenHour: queueHoop.queueOpenHour,
      queueCloseHour: queueHoop.queueCloseHour,
      shortOpenHour: queueHoop.shortOpenHour,
      shortCloseHour: queueHoop.shortCloseHour,
      timezoneName: queueHoop.timezoneName,
      isQueueClosed: queueHoop.isQueueClosed,
      isTodayHoliday: queueHoop.isTodayHoliday
    }

    return queueHoop.isQueueClosed ? fnTrue(response) : fnFalse(response);
  });
};

export const initializeStrings = () => {
  registerHandlebarsHelpers();

  const isHoopsEnabled = manager.serviceConfiguration.ui_attributes?.internalTransferAddonsPlugin?.isHoopsEnabled;

  if (isHoopsEnabled) {
    const closedStyle = 'color:maroon';

    manager.strings.WorkerDirectoryQueueItemText = `
      {{#WorkerDirectoryIsQueueClosed queue}}
        <div>{{queue.name}}</div>
        <div>
          <span style=${closedStyle}>CLOSED </span>
          {{#if isTodayHoliday}}
            <span style=${closedStyle}>Holiday </span>
          {{/if}}
          <span>(Hours: {{shortOpenHour}} - {{shortCloseHour}} {{timezoneName}})</span>
        </div>
      {{else}}
        {{queue.name}}
      {{/WorkerDirectoryIsQueueClosed}}
    `;
  }
};

