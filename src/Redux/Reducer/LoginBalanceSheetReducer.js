import {
  LOGIN_BALANCESHEET_START,
  LOGIN_BALANCESHEET_SUCCESS,
  LOGIN_BALANCESHEET_ERROR,
  FORGETPIN_BALANCESHEET_START,
  FORGETPIN_BALANCESHEET_SUCCESS,
  FORGETPIN_BALANCESHEET_ERROR
} from '../Actions/action.index';
  
  const initialState = {
    isLoading: false,
    success: false,
    error: false,
    data: [],
    forgetdata: [],
  };
  export default function (state = initialState, action) {
    switch (action.type) {
      case FORGETPIN_BALANCESHEET_START:
        return {
          ...state,
          isLoading: true,
        };
      case FORGETPIN_BALANCESHEET_SUCCESS:
        return {
          ...state,
          forgetdata: action.payload,
          isLoading: false,
          success: true,
        };
      case FORGETPIN_BALANCESHEET_ERROR:
        return {
          ...state,
         
          isLoading: false,
          error: true,
          success: false,
        };


      case LOGIN_BALANCESHEET_START:
        return {
          ...state,
          isLoading: true,
        };
      case LOGIN_BALANCESHEET_SUCCESS:
        return {
          ...state,
          data: action.payload,
          isLoading: false,
          success: true,
        };
      case LOGIN_BALANCESHEET_ERROR:
        return {
          ...state,
         
          isLoading: false,
          error: true,
          success: false,
        };



      default:
        return state;
    }
  }
  