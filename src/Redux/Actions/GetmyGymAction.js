import {
  GET_MY_GYM_ERROR,
  GET_MY_GYM_START,
  GET_MY_GYM_SUCCESS,
} from '../Actions/action.index';
import * as Constants from '../../utils/Constants';

import http from '../../http';

export const getmygym = (data) => {
  return (dispatch) => {
    dispatch({type: GET_MY_GYM_START});

    return http
      .post(Constants.API_URL_GET_MY_GYM, data)
      .then((res) => {
        console.log('=gymlist===================================');
        console.log(res);
        console.log('====gymlist================================');
        dispatch({
          type: GET_MY_GYM_SUCCESS,
          payload: res,
        });
        return Promise.resolve(res);
      })
      .catch((err) => {
        console.log('upload post MYGYMERROR : ', err);
        dispatch({
          type: GET_MY_GYM_ERROR,
        });
        return Promise.reject();
      });
  };
};
