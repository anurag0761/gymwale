import {
    SEND_NOTIFICATION_ERROR,
    SEND_NOTIFICATION_START,
    SEND_NOTIFICATION_SUCCESS,
  } from '../Actions/action.index';
  
  const initialState = {
    isLoading: false,
    success: false,
    error: false,
    data: [],
  };
  export default function (state = initialState, action) {
    switch (action.type) {
      case SEND_NOTIFICATION_START:
        return {
          ...state,
          isLoading: true,
        };
      case SEND_NOTIFICATION_SUCCESS:
       
        return {
          ...state,
          data: action.payload,
          isLoading: false,
          success: true,
          error: false,
        };
      case SEND_NOTIFICATION_ERROR:
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
  