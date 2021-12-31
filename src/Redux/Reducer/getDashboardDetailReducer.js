import {
  GET_DASHBOARD_DETAIL_START,
  GET_DASHBOARD_DETAIL_SUCCESS,
  GET_DASHBOARD_DETAIL_ERROR,
} from '../Actions/action.index';

const initialState = {
  isLoading: false,
  success: false,
  error: false,
  data: [],
};
export default function (state = initialState, action) {
  switch (action.type) {
    case GET_DASHBOARD_DETAIL_START:
      return {
        ...state,
        isLoading: true,
      };
    case GET_DASHBOARD_DETAIL_SUCCESS:
      return {
        ...state,
        data: action.payload,
        isLoading: false,
        success: true,
      };
    case GET_DASHBOARD_DETAIL_ERROR:
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
