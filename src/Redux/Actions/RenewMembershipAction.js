import {
    RENEWMEMBERSHIP_START,
    RENEWMEMBERSHIP_SUCCESS,
    RENEWMEMBERSHIP_ERROR,
  } from '../Actions/action.index';
  import * as Constants from '../../utils/Constants';
  import http from '../../http';
  
  export const RenewMembership = (data) => {
    return (dispatch) => {
      dispatch({type: 'RENEWMEMBERSHIP_START'});
      return http
        .post(Constants.API_URL_RENEW_MEMBERSHIP, data)
        .then((res) => {
          console.log('>>>>>>>>>>>renew>>>>>>>>>>');
          console.log(res);
          console.log('>>>>>>>>>>>renew>>>>>>>>>>');
          dispatch({
            type: 'RENEWMEMBERSHIP_SUCCESS',
            payload: res,
          });
          return Promise.resolve(res);
        })
        .catch((err) => {
          console.log('upload post renew : ', err);
          dispatch({
            type: 'RENEWMEMBERSHIP_ERROR',
          });
          return Promise.reject();
        });
    };
  };
  