import {
    RENEW_MESSAGE_START,
    RENEW_MESSAGE_SUCCESS,
    RENEW_MESSAGE_ERROR,
  } from '../Actions/action.index';
  import * as Constants from '../../utils/Constants';
  import http from '../../http';
  
  export const RenewMessage = (data) => {
    return (dispatch) => {
      dispatch({type: RENEW_MESSAGE_START});
      return http
        .post(Constants.API_URL_SEND_SMS_RENEW_MEMBERSHIP, data)
        .then((res) => {
        
          dispatch({
            type: RENEW_MESSAGE_SUCCESS,
            payload: res,
          });
          return Promise.resolve(res);
        })
        .catch((err) => {
          console.log('upload post messagerenew : ', err);
          dispatch({
            type: RENEW_MESSAGE_ERROR,
          });
          return Promise.reject();
        });
    };
  };
  