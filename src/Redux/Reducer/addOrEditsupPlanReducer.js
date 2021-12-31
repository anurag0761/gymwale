import { ADDOREDIT_SUBSCRIPTIONPLAN_ERROR,ADDOREDIT_SUBSCRIPTIONPLAN_START,ADDOREDIT_SUBSCRIPTIONPLAN_SUCCESS } from '../Actions/action.index';

const initialState = {
  isLoading: false,
  success: false,
  error: false,
  data: [],
};
export default function (state = initialState, action) {
  switch (action.type) {
    case ADDOREDIT_SUBSCRIPTIONPLAN_START:
      return {
        ...state,
        isLoading: true,
      };
    case ADDOREDIT_SUBSCRIPTIONPLAN_SUCCESS:
      
      return {
        ...state,
        gymfacility: action.payload,
        isLoading: false,
        success: true,
      };
    case ADDOREDIT_SUBSCRIPTIONPLAN_ERROR:
      return {
        ...state,
        ...action.payload,
        isLoading: false,
        error: true,
        success: false,
      };
    default:
      return state;
  }
}
