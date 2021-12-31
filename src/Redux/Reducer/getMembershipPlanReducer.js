import {
    GET_MEMBERSHIP_PLANS_ERROR,
    GET_MEMBERSHIP_PLANS_START,
    GET_MEMBERSHIP_PLANS_SUCCESS,
  } from '../Actions/action.index';
  import * as Constants from '../../utils/Constants';

const initialState = {
  isLoading: false,
  success: false,
  error: false,
  plans: [],
};
export default function (state = initialState, action) {
  switch (action.type) {
    case GET_MEMBERSHIP_PLANS_START:
      return {
        ...state,
        isLoading: true,
      };
    case GET_MEMBERSHIP_PLANS_SUCCESS:
      return {
        ...state,
        plans: action.payload,
        isLoading: false,
        success: true,
        error: false,
      };
    case GET_MEMBERSHIP_PLANS_ERROR:
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
