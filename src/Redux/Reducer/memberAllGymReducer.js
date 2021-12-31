import {
    MEMBER_ALL_GYM_START,
    MEMBER_ALL_GYM_SUCCESS,
    MEMBER_ALL_GYM_ERROR,
  } from '../Actions/action.index';
  
  const initialState = {
    isLoading: false,
    success: false,
    error: false,
    data: [],
  };
  export default function (state = initialState, action) {
    switch (action.type) {
      case MEMBER_ALL_GYM_START:
        return {
          ...state,
          isLoading: true,
        };
      case MEMBER_ALL_GYM_SUCCESS:
        return {
          ...state,
          data: action.payload,
          isLoading: false,
          success: true,
          error: false,
        };
      case MEMBER_ALL_GYM_ERROR:
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
  