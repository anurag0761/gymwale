import {
    FETCH_ALL_ATTENDANCE_START,
    FETCH_ALL_ATTENDANCE_SUCCESS,
    FETCH_ALL_ATTENDANCE_ERROR,
  } from '../Actions/action.index';
  
  const initialState = {
    isLoading: false,
    success: false,
    error: false,
    data: [],
  };
  export default function (state = initialState, action) {
    switch (action.type) {
      case FETCH_ALL_ATTENDANCE_START:
        return {
          ...state,
          isLoading: true,
        };
      case FETCH_ALL_ATTENDANCE_SUCCESS:
        return {
          ...state,
          data: action.payload,
          isLoading: false,
          success: true,
        };
      case FETCH_ALL_ATTENDANCE_ERROR:
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
  