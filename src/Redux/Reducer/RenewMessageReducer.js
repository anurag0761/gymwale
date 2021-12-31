import {
    RENEW_MESSAGE_START,
    RENEW_MESSAGE_SUCCESS,
    RENEW_MESSAGE_ERROR,
  } from '../Actions/action.index';
  
  const initialState = {
    isLoading: false,
    success: false,
    error: false,
    data: [],
  };
  export default function (state = initialState, action) {
    switch (action.type) {
      case RENEW_MESSAGE_START:
        return {
          ...state,
          isLoading: true,
        };
      case RENEW_MESSAGE_SUCCESS:
        return {
          ...state,
          data: action.payload,
          isLoading: false,
          success: true,
          error: false,
        };
      case RENEW_MESSAGE_ERROR:
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
  