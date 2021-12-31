import { FETCH_SUBSCRIPTION_ERROR,FETCH_SUBSCRIPTION_START,FETCH_SUBSCRIPTION_SUCCESS,
  DELETE_MEMBERSHIP_START,
  DELETE_MEMBERSHIP_SUCCESS,
  DELETE_MEMBERSHIP_ERROR } from '../Actions/action.index';
import _ from 'lodash';

const initialState = {
  isLoading: false,
  success: false,
  error: false,
  subscription: [],
  deletesub: []
};
export default function (state = initialState, action) {
  switch (action.type) {
    case DELETE_MEMBERSHIP_START:
      return {
        ...state,
        isLoading: true,
      };
    case DELETE_MEMBERSHIP_SUCCESS:
      return {
        ...state,
        deletesub: action.payload,
        isLoading: false,
        success: true,
      };
    case DELETE_MEMBERSHIP_ERROR:
      return {
        ...state,
        ...action.payload,
        isLoading: false,
        error: true,
        success: false,
      };
      





      case FETCH_SUBSCRIPTION_START:
        return {
          ...state,
          isLoading: true,
        };
      case FETCH_SUBSCRIPTION_SUCCESS:
        return {
          ...state,
          subscription: action.payload,
          isLoading: false,
          success: true,
        };
      case FETCH_SUBSCRIPTION_ERROR:
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
