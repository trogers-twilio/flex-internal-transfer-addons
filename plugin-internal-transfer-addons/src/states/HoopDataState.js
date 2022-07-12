const ACTION_STORE_HOOPS = 'STORE_HOOPS';

const initialState = {
  hoopData: {}
};

export class Actions {
  static storeHoops = (hoopData) => {
    return ({ type: ACTION_STORE_HOOPS, payload: hoopData })};
}

export function reduce(state = initialState, action) {
  // eslint-disable-next-line sonarjs/no-small-switch
  switch (action.type) {
    case ACTION_STORE_HOOPS: {
      return {
        ...state,
        hoopData: action.payload
      };
    }

    default:
      return state;
  }
}
