import {
    RECIEVEPAYMENT_START,
    RECIEVEPAYMENT_SUCCESS,
    RECIEVEPAYMENT_ERROR,
  } from '../Actions/action.index';
  import * as Constants from '../../utils/Constants';
  import http from '../../http';
  
  export const paymentRecieve = (data) => {
    return (dispatch) => {
      dispatch({type: RECIEVEPAYMENT_START});
      return http
        .post(Constants.API_URL_RECEIVE_FEES, data)
        .then((res) => {
        console.log('===recie=================================');
        console.log(res);
        console.log('======redice==============================');
          dispatch({
            type: RECIEVEPAYMENT_SUCCESS,
            payload: res,
          });
          return Promise.resolve(res);
        })
        .catch((err) => {
          console.log('upload post recievepayment : ', err);
          dispatch({
            type: RECIEVEPAYMENT_ERROR,
          });
          return Promise.reject();
        });
    };
  };
  