import { Actions, Manager, Notifications, WorkerDirectoryTabs } from '@twilio/flex-ui';

import { transferQueues, queueHoops } from '../helpers'
import TaskRouterService from '../services/TaskRouterService';
import { FlexNotification } from '../enums';

const manager = Manager.getInstance();

export const initializeListeners = () => {
  Actions.addListener("beforeShowDirectory", (payload) => {
    // This logic is for filtering out queues that are not eligible for
    // transfer from the queue transfer directory
    const queueFilterExpression = transferQueues.getQueueFilterExpression();
    console.debug('queueFilterExpression:', queueFilterExpression);
    
    if (queueFilterExpression) {
      WorkerDirectoryTabs.defaultProps.hiddenQueueFilter = queueFilterExpression;
    }
  });

  Actions.addListener("beforeTransferTask", async (payload, abortAction) => {
    const isHoopsEnabled = manager.serviceConfiguration.ui_attributes?.internalTransferAddonsPlugin?.isHoopsEnabled;

    const taskQueueSidPrefix = 'WQ';
    const isQueueTarget = payload.targetSid?.toUpperCase().startsWith(taskQueueSidPrefix);

    if (isHoopsEnabled && isQueueTarget) {
      const queueHoopToday = queueHoops.getQueueHoopForToday(payload.targetSid);

      if (queueHoopToday.isQueueClosed) {
        console.log('Target transfer queue is closed. Aborting transfer.', queueHoopToday);
        const { queueName, queueHours } = queueHoopToday;
        const notificationPayload = {
          queueName,
          queueHours
        }
        const notificationId = queueHoopToday.isTodayHoliday
          ? FlexNotification.transferQueueHoliday
          : FlexNotification.transferQueueClosed;

        Notifications.showNotification(notificationId, notificationPayload);
        abortAction();
      }
    }

    try{
      // This logic is added to ensure the task is set to the same priority as
      // new tasks going into the target queue. If this isn't done, we risk
      // the task getting stuck behind higher priority tasks until the target
      // queue is emptied of all higher priority pending tasks
      const taskWorkflows = await TaskRouterService.getWorkflows();
      const newQueueSid = payload.targetSid; 
      let queuePriority;
      let workflowConfig;
      
      let targetQueuePriority = 0;
      for (let [key, value] of Object.entries(taskWorkflows)) {

        workflowConfig = value.configuration;
        const configuration_data = JSON.parse(workflowConfig);
        const workflowFilters = configuration_data.task_routing.filters || [];

        workflowFilters.forEach(filters => {
          if (filters.targets[0].queue === newQueueSid ){
            queuePriority = filters.targets[0].priority;

            // Ensuring the highest possible priority found for this TaskQueue is
            // used so it doesn't get stuck behind new tasks in the target queue
            targetQueuePriority = queuePriority > targetQueuePriority ? queuePriority : targetQueuePriority;
          }
        })  
      }

      if (targetQueuePriority !== 0) {
        console.debug('beforeTransferTask, task priority will be set to',
          `target queue priority ${targetQueuePriority} on transfer`
        );
        payload.options.priority = targetQueuePriority;
      }
    }
    catch (error){
      console.log(error);
    }
  });
}
