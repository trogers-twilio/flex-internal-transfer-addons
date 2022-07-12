import { Manager } from '@twilio/flex-ui';

import { queueHoops, utils } from '../helpers';

const manager = Manager.getInstance();

const generateStaticQueueFilterExpression = () => {
  const hiddenTransferQueues = manager.serviceConfiguration.ui_attributes?.internalTransferAddonsPlugin?.hiddenTransferQueues;

  let expression = "";

  if (!Array.isArray(hiddenTransferQueues) || hiddenTransferQueues.length === 0) {
    expression = "";
  } else if (hiddenTransferQueues.length <= 29) {
    expression = `data.queue_name NOT_IN ${JSON.stringify(hiddenTransferQueues)}`;
  } else {
    const maxExpressionArraySize = 29;
    const hiddenQueueChunks = utils.sliceArrayIntoChunks(hiddenTransferQueues, maxExpressionArraySize);

    for (let i = 0; i < hiddenQueueChunks.length; i++) {
      const chunk = hiddenQueueChunks[i];
      expression += `data.queue_name NOT_IN ${JSON.stringify(chunk)}`;

      if (i + 1 < hiddenQueueChunks.length) {
        expression += ' AND ';
      }
    }
  }

  return expression;
}

export const getQueueFilterExpression = () => {
  const staticQueueFilterExpression = generateStaticQueueFilterExpression();

  let finalQueueFilterExpression = `(${staticQueueFilterExpression})`;

  const isHoopsEnabled = manager.serviceConfiguration.ui_attributes?.internalTransferAddonsPlugin?.isHoopsEnabled;

  if (isHoopsEnabled) {
    const queueHoopsFilterExpression = queueHoops.evalHoops();
    finalQueueFilterExpression += ` AND (${queueHoopsFilterExpression})`;
  }

  return finalQueueFilterExpression;
}
