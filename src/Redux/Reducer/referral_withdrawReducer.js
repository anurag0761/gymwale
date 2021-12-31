import {
    REFERRAL_WITHDRAWAL_START,
   REFERRAL_WITHDRAWAL_SUCCESS,
    REFERRAL_WITHDRAWAL_ERROR,
 } from '../Actions/action.index';
  
  const initialState = {
    isLoading: false,
    success: false,
    error: false,
    withdrawdata: [],
  };
  export default function (state = initialState, action) {
    switch (action.type) {
      case REFERRAL_WITHDRAWAL_START:
        return {
          ...state,
          isLoading: true,
        };
      case REFERRAL_WITHDRAWAL_SUCCESS:
        return {
          ...state,
          withdrawdata: action.payload,
          isLoading: false,
          success: true,
          error: false,
        };
      case REFERRAL_WITHDRAWAL_ERROR:
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
  