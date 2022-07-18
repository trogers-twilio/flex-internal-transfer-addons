import { queueHoops }  from './index';

export const registerHelpers = () => {
  window.Handlebars.registerHelper('breakLines', function(text) {
    let newText = window.Handlebars.Utils.escapeExpression(text);
    newText = newText.replace(/\n/g, '<br>');
    console.debug('Handlebars breakLines, newText:', newText);

    return new window.Handlebars.SafeString(newText);
  });

  window.Handlebars.registerHelper('IsWorkerDirectoryQueueClosed', function (payload, options) {
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
      queueHours: queueHoop.queueHours,
      isQueueClosed: queueHoop.isQueueClosed,
      isTodayHoliday: queueHoop.isTodayHoliday
    }

    return queueHoop.isQueueClosed ? fnTrue(response) : fnFalse(response);
  });
};
