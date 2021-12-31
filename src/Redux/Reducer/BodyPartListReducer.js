import {
    BODY_PART_LIST_START,
    BODY_PART_LIST_SUCCESS,
    BODY_PART_LIST_ERROR,
  } from '../Actions/action.index';
  
  const initialState = {
    isLoading: false,
    success: false,
    error: false,
    data: [],
  };
  export default function (state = initialState, action) {
    switch (action.type) {
      case BODY_PART_LIST_START:
        return {
          ...state,
          isLoading: true,
        };
      case BODY_PART_LIST_SUCCESS:
        return {
          ...state,
          data: action.payload,
          isLoading: false,
          success: true,
        };
      case BODY_PART_LIST_ERROR:
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
  