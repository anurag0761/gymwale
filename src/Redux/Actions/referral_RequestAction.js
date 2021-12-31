import {
     REFERRAL_WITHDRAWAL_START,
    REFERRAL_WITHDRAWAL_SUCCESS,
     REFERRAL_WITHDRAWAL_ERROR,
  } from '../Actions/action.index';
  import * as Constants from '../../utils/Constants';
  import http from '../../http';
  
  export const ReferralWithdrawalRequestaction = (data) => {
    return (dispatch) => {
      dispatch({type: REFERRAL_WITHDRAWAL_START});
      return http
        .post(Constants.API_URL_REFERRAL_WITHDRAW_ADD, data)
        .then((res) => {
          
          dispatch({
            type: REFERRAL_WITHDRAWAL_SUCCESS,
            payload: res,
          });
          return Promise.resolve(res);
        })
        .catch((err) => {
          console.log('upload post error WITHDRAW_REQUEST: ', err);
          dispatch({
            type: REFERRAL_WITHDRAWAL_ERROR,
          });
          return Promise.reject();
        });
    };
  };
  