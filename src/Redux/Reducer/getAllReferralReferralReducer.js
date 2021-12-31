import {
    GET_ALL_REFERRALS_START,
    GET_ALL_REFERRALS_SUCCESS,
    GET_ALL_REFERRALS_ERROR,
  } from '../Actions/action.index';

const initialState = {
  isLoading: false,
  success: false,
  error: false,
  referralData: [],
};
export default function (state = initialState, action) {
  switch (action.type) {
    case GET_ALL_REFERRALS_START:
      return {
        ...state,
        isLoading: true,
      };
    case GET_ALL_REFERRALS_SUCCESS:
    
      return {
        ...state,
        referralData: action.payload,
        isLoading: false,
        success: true,
      };
    case GET_ALL_REFERRALS_ERROR:
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
