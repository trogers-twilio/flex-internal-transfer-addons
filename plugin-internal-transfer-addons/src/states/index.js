import { combineReducers } from 'redux';

import { reduce as QueueHoopsReducer } from './QueueHoopsState';

// Register your redux store under a unique namespace
export const namespace = 'internal-transfer-addons';

// Combine the reducers
export default combineReducers({
  queueHoops: QueueHoopsReducer
});
