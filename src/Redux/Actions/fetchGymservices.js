import {
  FETCH_GYMSERVICES_START,
  FETCH_GYMSERVICES_ERROR,
  FETCH_GYMSERVICES_SUCCESS,
  UPADATESERVICES_START,
  UPADATESERVICES_SUCCESS,
  UPADATESERVICES_ERROR,
} from '../Actions/action.index';
import * as Constants from '../../utils/Constants';

import http from '../../http';

export const updateServices = (data) => {
  return (dispatch) => {
    dispatch({type: UPADATESERVICES_START});
    return http
      .post(Constants.API_URL_UPDATE_SERVICES, data)
      .then((res) => {
        dispatch({
          type: UPADATESERVICES_SUCCESS,
          payload: res,
        });
        return Promise.resolve(res);
      })
      .catch((err) => {
        console.log('upload post API_URL_UPDATE_SERVICES : ', err);
        dispatch({
          type: UPADATESERVICES_ERROR,
        });
        return Promise.reject();
      });
  };
};

export const fetchGymServices = (data) => {
  return (dispatch) => {
    dispatch({type: FETCH_GYMSERVICES_START});
    return http
      .post(Constants.API_URL_GYM_SERVICES, data)
      .then((res) => {
        let valid = res[Constants.KEY_VALID];
        //   let gymServices = "";
        if (valid) {
          let gymServices = res[Constants.KEY_BODY];

          dispatch({
            type: FETCH_GYMSERVICES_SUCCESS,
            payload: gymServices,
          });
          return Promise.resolve(res);
        }
      })
      .catch((err) => {
        console.log('upload post gymservices : ', err);
        dispatch({
          type: FETCH_GYMSERVICES_ERROR,
        });
        return Promise.reject();
      });
  };
};
