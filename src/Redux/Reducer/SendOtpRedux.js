import {
  RESEND_OTP_ERROR,
  RESEND_OTP_START,
  RESEND_OTP_SUCCESS,
} from '../Actions/action.index';

const initialState = {
  isLoading: false,
  success: false,
  error: false,
  otpdata: [],
};
export default function (state = initialState, action) {
  switch (action.type) {
    case RESEND_OTP_START:
      return {
        ...state,
        isLoading: true,
      };
    case RESEND_OTP_SUCCESS:
     
      return {
        ...state,
        otpdata: action.payload,
        isLoading: false,
        success: true,
        error: false,
      };
    case RESEND_OTP_ERROR:
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
