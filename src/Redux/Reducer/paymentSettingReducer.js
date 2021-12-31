import {
    PAYMENT_SETTING_ERROR,
    PAYMENT_SETTING_START,
    PAYMENT_SETTING_SUCCESS,
  } from '../Actions/action.index';
  
  const initialState = {
    isLoading: false,
    success: false,
    error: false,
    data: [],
  };
  export default function (state = initialState, action) {
    switch (action.type) {
      case PAYMENT_SETTING_START:
        return {
          ...state,
          isLoading: true,
        };
      case PAYMENT_SETTING_SUCCESS:
      
        return {
          ...state,
          data: action.payload,
          isLoading: false,
          success: true,
          error: false,
        };
      case PAYMENT_SETTING_ERROR:
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
  