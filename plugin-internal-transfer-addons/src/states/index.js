import { combineReducers } from 'redux';

import { reduce as HoopDataReducer } from './HoopDataState';

// Register your redux store under a unique namespace
export const namespace = 'internal-transfer-addons';

// Combine the reducers
export default combineReducers({
  hoopData: HoopDataReducer
});
