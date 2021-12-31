import {
    URL_ADD_GYM_START,
    URL_ADD_GYM_SUCCESS,
    URL_ADD_GYM_ERROR,
  } from '../Actions/action.index';
  import * as Constants from '../../utils/Constants';
  import http from '../../http';
  
  export const urlAddGym = (data) => {
    return (dispatch) => {
      dispatch({type: URL_ADD_GYM_START});
      return http
        .post(Constants.API_URL_ADD_GYM_MEMBER_APP, data)
        .then((res) => {
          dispatch({
            type: URL_ADD_GYM_SUCCESS,
            payload: res,
          });
          return Promise.resolve(res);
        })
        .catch((err) => {
          console.log('upload post error url_add_gym : ', err);
          dispatch({
            type: URL_ADD_GYM_ERROR,
          });
          return Promise.reject();
        });
    };
  };
  