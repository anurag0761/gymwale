import {
  ACTIVE_PLAN_ERROR,
  ACTIVE_PLAN_START,
  ACTIVE_PLAN_SUCCESS,
} from '../Actions/action.index';

const initialState = {
  isLoading: false,
  success: false,
  error: false,
  data: [],
};
export default function (state = initialState, action) {
  switch (action.type) {
    case ACTIVE_PLAN_START:
      return {
        ...state,
        isLoading: true,
      };
    case ACTIVE_PLAN_SUCCESS:
      return {
        ...state,
        data: action.payload,
        isLoading: false,
        success: true,
        error: false,
      };
    case ACTIVE_PLAN_ERROR:
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
