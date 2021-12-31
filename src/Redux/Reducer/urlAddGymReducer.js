import {
    URL_ADD_GYM_START,
    URL_ADD_GYM_SUCCESS,
    URL_ADD_GYM_ERROR,
  } from '../Actions/action.index';
  
  const initialState = {
    isLoading: false,
    success: false,
    error: false,
    data: [],
  };
  export default function (state = initialState, action) {
    switch (action.type) {
      case URL_ADD_GYM_START:
        return {
          ...state,
          isLoading: true,
        };
      case URL_ADD_GYM_SUCCESS:
        console.log(',addgym,,,,,,,,,,,,');
        console.log(action);
        console.log(',,addgym,,,,,,,,,,,');
        return {
          ...state,
          data: action.payload,
          isLoading: false,
          success: true,
          error: false,
        };
      case URL_ADD_GYM_ERROR:
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
  