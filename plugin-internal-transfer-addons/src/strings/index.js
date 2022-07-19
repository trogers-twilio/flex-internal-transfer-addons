import { Manager } from '@twilio/flex-ui';

const manager = Manager.getInstance();

export const initializeStrings = () => {
  const isHoopsEnabled = manager.serviceConfiguration.ui_attributes?.internalTransferAddonsPlugin?.isHoopsEnabled;

  if (isHoopsEnabled) {
    const closedStyle = 'color:maroon';

    manager.strings.WorkerDirectoryQueueItemText = `
      {{#IsWorkerDirectoryQueueClosed queue}}
        <div title="{{queueHours}}">{{queue.name}}</div>
        <div title="{{queueHours}}">
          <span style=${closedStyle}>CLOSED </span>
          {{#if isTodayHoliday}}
            <span style=${closedStyle}>Holiday </span>
          {{/if}}
          <span>(Hover here to see hours)</span>
        </div>
      {{else}}
        {{queue.name}}
      {{/IsWorkerDirectoryQueueClosed}}
    `;
  }
};

