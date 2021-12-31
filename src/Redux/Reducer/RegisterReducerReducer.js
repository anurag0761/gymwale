import {
    REGISTER_ERROR,
    REGISTER_START,
    REGISTER_SUCCESS,
  } from '../Actions/action.index';
  
  const initialState = {
    isLoading: false,
    success: false,
    error: false,
    data: [],
  };
  export default function (state = initialState, action) {
    switch (action.type) {
      case REGISTER_START:
        return {
          ...state,
          isLoading: true,
        };
      case REGISTER_SUCCESS:
       
        return {
          ...state,
          data: action.payload,
          isLoading: false,
          success: true,
          error: false,
        };
      case REGISTER_ERROR:
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
  