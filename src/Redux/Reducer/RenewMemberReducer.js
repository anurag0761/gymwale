import {
    RENEWMEMBERSHIP_ERROR,
    RENEWMEMBERSHIP_START,
    RENEWMEMBERSHIP_SUCCESS,
  } from '../Actions/action.index';
  
  const initialState = {
    isLoading: false,
    success: false,
    error: false,
    data: [],
  };
  export default function (state = initialState, action) {
    switch (action.type) {
      case 'RENEWMEMBERSHIP_START':
        return {
          ...state,
          isLoading: true,
        };
      case 'RENEWMEMBERSHIP_SUCCESS':
       
        return {
          ...state,
          data: action.payload,
          isLoading: false,
          success: true,
          error: false,
        };
      case 'RENEWMEMBERSHIP_ERROR':
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
  