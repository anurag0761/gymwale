import {
  FETCH_GYMSERVICES_START,
  FETCH_GYMSERVICES_ERROR,
  FETCH_GYMSERVICES_SUCCESS,
  UPADATESERVICES_START,
  UPADATESERVICES_SUCCESS,
  UPADATESERVICES_ERROR,
} from '../Actions/action.index';

import _ from 'lodash';

const initialState = {
  isLoading: false,
  success: false,
  error: false,
  gymService: [],
  updateservices: [],
};
export default function (state = initialState, action) {
  switch (action.type) {
    case UPADATESERVICES_START:
      return {
        ...state,
        isLoading: true,
      };
    case UPADATESERVICES_SUCCESS:
      return {
        ...state,
        updateservices: action.payload,
        isLoading: false,
        success: true,
      };
    case UPADATESERVICES_ERROR:
      return {
        ...state,
        ...action.payload,
        isLoading: false,
        error: true,
        success: false,
      };

    case FETCH_GYMSERVICES_START:
      return {
        ...state,
        isLoading: true,
      };
    case FETCH_GYMSERVICES_SUCCESS:
      return {
        ...state,
        gymService: action.payload,
        isLoading: false,
        success: true,
      };
    case FETCH_GYMSERVICES_ERROR:
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
