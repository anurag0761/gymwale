import {
    SEARCH_GYM_ERROR,
    SEARCH_GYM_START,
    SEARCH_GYM_SUCCESS,
  } from '../Actions/action.index';
  
  const initialState = {
    isLoading: false,
    success: false,
    error: false,
    data: [],
  };
  export default function (state = initialState, action) {
    switch (action.type) {
      case SEARCH_GYM_START:
        return {
          ...state,
          isLoading: true,
        };
      case SEARCH_GYM_SUCCESS:
       
        return {
          ...state,
          data: action.payload,
          isLoading: false,
          success: true,
          error: false,
        };
      case SEARCH_GYM_ERROR:
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
  