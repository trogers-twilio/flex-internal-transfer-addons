import { Actions, WorkerDirectoryTabs } from '@twilio/flex-ui';

import { transferQueues } from '../helpers'
import TaskRouterService from '../services/TaskRouterService';


const initialize = () => {
  Actions.addListener("beforeShowDirectory", (payload) => {
    // This logic is for filtering out queues that are not eligible for
    // transfer from the queue transfer directory
    const queueFilterExpression = transferQueues.getQueueFilterExpression();
    console.debug('queueFilterExpression:', queueFilterExpression);
    WorkerDirectoryTabs.defaultProps.hiddenQueueFilter = queueFilterExpression;
  });

  Actions.addListener("beforeTransferTask", async (payload) => {

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
            // used to it doesn't get stuck behind new tasks in the target queue
            targetQueuePriority = queuePriority > targetQueuePriority ? queuePriority : targetQueuePriority;
          }
        })  
      }

      if (targetQueuePriority !== 0) {
        console.debug('beforeTransferTask, Setting task priority to target queue priority', targetQueuePriority);
        payload.options.priority = targetQueuePriority;
      }
    }
    catch (error){
      console.log(error);
    }
  });
}

export default {
  initialize
};
