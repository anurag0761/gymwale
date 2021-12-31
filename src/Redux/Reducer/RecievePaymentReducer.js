import {
    RECIEVEPAYMENT_START,
    RECIEVEPAYMENT_SUCCESS,
    RECIEVEPAYMENT_ERROR,
  } from '../Actions/action.index';
  
  const initialState = {
    isLoading: false,
    success: false,
    error: false,
    data: [],
  };
  export default function (state = initialState, action) {
    switch (action.type) {
      case RECIEVEPAYMENT_START:
        return {
          ...state,
          isLoading: true,
        };
      case RECIEVEPAYMENT_SUCCESS:
        return {
          ...state,
          data: action.payload,
          isLoading: false,
          success: true,
          error: false,
        };
      case RECIEVEPAYMENT_ERROR:
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
  