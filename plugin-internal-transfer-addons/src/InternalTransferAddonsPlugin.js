import React from 'react';
import { VERSION } from '@twilio/flex-ui';
import { FlexPlugin } from '@twilio/flex-plugin';

import reducers, { namespace } from './states';
import { Actions as HoopDataActions} from './states/HoopDataState';
import { queueHoops } from './helpers';
import listeners from './listeners';
import TaskRouterService from './services/TaskRouterService';


const PLUGIN_NAME = 'InternalTransferAddonsPlugin';

export default class InternalTransferAddonsPlugin extends FlexPlugin {
  constructor() {
    super(PLUGIN_NAME);
  }

  /**
   * This code is run when your plugin is being started
   * Use this to modify any UI components or attach to the actions framework
   *
   * @param flex { typeof import('@twilio/flex-ui') }
   * @param manager { import('@twilio/flex-ui').Manager }
   */
  async init(flex, manager) {
    this.registerReducers(manager);

    listeners.initialize();

    queueHoops.loadHoops(HoopDataActions.storeHoops);

    TaskRouterService.getWorkflows()
      .then(console.log('Workflows were retrieved'));

    // Removing the Agent tab from the transfer directory to disable
    // transferring directly to an agent instead of a queue
    flex.WorkerDirectoryTabs.Content.remove('workers');
  }

  /**
   * Registers the plugin reducers
   *
   * @param manager { Flex.Manager }
   */
  registerReducers(manager) {
    if (!manager.store.addReducer) {
      // eslint-disable-next-line
      console.error(`You need FlexUI > 1.9.0 to use built-in redux; you are currently on ${VERSION}`);
      return;
    }

    manager.store.addReducer(namespace, reducers);
  }
}
