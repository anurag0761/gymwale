import {
  FETCH_GYMLIST_ERROR,
  FETCH_GYMLIST_START,
  FETCH_GYMLIST_SUCCESS,
  FETCH_ADDGYM_ERROR,
  FETCH_ADDGYM_START,
  FETCH_ADDGYM_SUCCESS,
  FETCH_EDITGYM_START,
  FETCH_EDITGYM_SUCCESS,
  FETCH_EDITGYM_ERROR,
} from '../Actions/action.index';
import * as Constants from '../../utils/Constants';

import http from '../../http';

export const fetchgymlist = (data) => {
  return (dispatch) => {
    dispatch({type: FETCH_GYMLIST_START});
    return http
      .post(Constants.API_URL_GET_ALL_GYM, data)
      .then((res) => {
        dispatch({
          type: FETCH_GYMLIST_SUCCESS,
          gymlistpayload: res,
        });
        return Promise.resolve(res);
      })
      .catch((err) => {
        console.log('upload post gymaction : ', err);
        dispatch({
          type: FETCH_GYMLIST_ERROR,
        });
        return Promise.reject();
      });
  };
};;

export const addgym = (data) => {
  return (dispatch) => {
    dispatch({type: FETCH_ADDGYM_START});
    return http
      .post(Constants.API_URL_ADD_GYM, data)
      .then((res) => {
        console.log('resdj====================================');
        console.log(res);
        console.log('resdj====================================');
        dispatch({
          type: FETCH_ADDGYM_SUCCESS,
          payload: res,
        });
        return Promise.resolve(res);
      })
      .catch((err) => {
        console.log('upload post ADDGYM : ', err);
        dispatch({
          type: FETCH_ADDGYM_ERROR,
        });
        return Promise.reject();
      });
  };
};;

export const editgym = (data) => {
  return (dispatch) => {
    dispatch({type: FETCH_EDITGYM_START});
    return http
      .post(Constants.API_URL_EDIT_GYM, data)
      .then((res) => {
        dispatch({
          type: FETCH_EDITGYM_SUCCESS,
          editgympayload: res,
        });
        return Promise.resolve(res);
      })
      .catch((err) => {
        console.log('upload post ADDGYM : ', err);
        dispatch({
          type: FETCH_EDITGYM_ERROR,
        });
        return Promise.reject();
      });
  };
};;
