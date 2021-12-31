import {
    LOGIN_BALANCESHEET_START,
    LOGIN_BALANCESHEET_SUCCESS,
    LOGIN_BALANCESHEET_ERROR,
    FORGETPIN_BALANCESHEET_START,
    FORGETPIN_BALANCESHEET_SUCCESS,
    FORGETPIN_BALANCESHEET_ERROR
  } from '../Actions/action.index';
  import * as Constants from '../../utils/Constants';
  import http from '../../http';
  
  export const loginbalancesheet = (data) => {
    return (dispatch) => {
      dispatch({type: LOGIN_BALANCESHEET_START});
      return http
        .post(Constants.API_URL_LOGIN_BALANCESHEET, data)
        .then((res) => {
            
          dispatch({
            type: LOGIN_BALANCESHEET_SUCCESS,
            payload: res,
          });
          return Promise.resolve(res);
        })
        .catch((err) => {
          console.log('upload post LogiBalancesheet : ', err);
          dispatch({
            type: LOGIN_BALANCESHEET_ERROR,
          });
          return Promise.reject();
        });
    };
  };
  

  export const forgetPinbalancesheet = (data) => {
    return (dispatch) => {
      dispatch({type: FORGETPIN_BALANCESHEET_START});
      return http
        .post(Constants.API_URL_FORGOT_BALANCESHEET_PIN, data)
        .then((res) => {
            console.log('forgetpin====================================');
            console.log(res);
            console.log('forgetpin==lo==================================');
          dispatch({
            type: FORGETPIN_BALANCESHEET_SUCCESS,
            payload: res,
          });
          return Promise.resolve(res);
        })
        .catch((err) => {
          console.log('upload post FORGETPINBALANCE : ', err);
          dispatch({
            type: FORGETPIN_BALANCESHEET_ERROR,
          });
          return Promise.reject();
        });
    };
  };

  