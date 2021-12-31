import {
    REGISTER_START,
    REGISTER_SUCCESS,
    REGISTER_ERROR,
  } from '../Actions/action.index';
  import * as Constants from '../../utils/Constants';
  import http from '../../http';
  
  export const RegisterAction = (data) => {
    return (dispatch) => {
      dispatch({type: REGISTER_START});
      return http
        .post(Constants.API_URL_REGISTER, data)
        .then((res) => {
          console.log('>>>>>>>>>>>registger>>>>>>>>>>');
          console.log(res);
          console.log('>>>>>>>>>>>registger>>>>>>>>>>');
          dispatch({
            type: REGISTER_SUCCESS,
            payload: res,
          });
          return Promise.resolve(res);
        })
        .catch((err) => {
          console.log('upload post register : ', err);
          dispatch({
            type: REGISTER_ERROR,
          });
          return Promise.reject();
        });
    };
  };
  