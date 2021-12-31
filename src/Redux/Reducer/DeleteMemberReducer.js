import {
    DELETE_MEMBER_START,
    DELETE_MEMBER_SUCCESS,
    DELETE_MEMBER_ERROR,
  } from '../Actions/action.index';
  
  const initialState = {
    isLoading: false,
    success: false,
    error: false,
    data: [],
  };
  export default function (state = initialState, action) {
    switch (action.type) {
      case DELETE_MEMBER_START:
        return {
          ...state,
          isLoading: true,
        };
      case DELETE_MEMBER_SUCCESS:
        return {
          ...state,
          data: action.payload,
          isLoading: false,
          success: true,
        };
      case DELETE_MEMBER_ERROR:
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
  