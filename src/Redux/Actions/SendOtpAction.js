import {
  RESEND_OTP_ERROR,
  RESEND_OTP_START,
  RESEND_OTP_SUCCESS,
} from '../Actions/action.index';
import * as Constants from '../../utils/Constants';
import http from '../../http';

export const resendOtpCode = (data) => {
  return (dispatch) => {
    dispatch({type: RESEND_OTP_START});
    return http
      .post(Constants.API_URL_RESEND_OTP, data)
      .then((res) => {
        dispatch({
          type: RESEND_OTP_SUCCESS,
          payload: res,
        });
        return Promise.resolve(res);
      })
      .catch((err) => {
        console.log('upload post error resendotp : ', err);
        dispatch({
          type: RESEND_OTP_ERROR,
        });
        return Promise.reject();
      });
  };
};
