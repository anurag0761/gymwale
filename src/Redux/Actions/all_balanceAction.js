import {
    ALL_BALANCE_ERROR,
    ALL_BALANCE_START,
    ALL_BALANCE_SUCCESS,
    BALANCESHEET_PIN_SUCCESS,
    BALANCESHEET_PIN_START,
    BALANCESHEET_PIN_ERROR
  } from '../Actions/action.index';
  import * as Constants from '../../utils/Constants';
  
  import http from '../../http';
  
  export const allBalance = (data) => {
    return (dispatch) => {
      dispatch({type: ALL_BALANCE_START});
      return http
        .post(Constants.API_URL_GET_GYM_BALANCE_SHEET_DATA, data)
        .then((res) => {
          
          dispatch({
            type: ALL_BALANCE_SUCCESS,
            payload: res,
          });
          return Promise.resolve(res);
        })
        .catch((err) => {
          console.log('upload post addplan : ', err);
          dispatch({
            type: ALL_BALANCE_ERROR,
          });
          return Promise.reject();
        });
    };
  };


  export const changebalancesheetpin = (data) => {
    return (dispatch) => {
      dispatch({type: 'BALANCESHEET_PIN_START'});
      return http
        .post(Constants.API_URL_BALANCESHEET_CHANGE_PIN, data)
        .then((res) => {
          console.log('====================================');
          console.log(res);
          console.log('====================================');
          
          dispatch({
            type: 'BALANCESHEET_PIN_SUCCESS',
            payload: res,
          });
          return Promise.resolve(res);
        })
        .catch((err) => {
          console.log('upload post CHANGEPIN : ', err);
          dispatch({
            type: 'BALANCESHEET_PIN_ERROR',
          });
          return Promise.reject();
        });
    };
  };

  

  