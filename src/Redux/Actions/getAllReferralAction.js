import {
  GET_ALL_REFERRALS_START,
  GET_ALL_REFERRALS_SUCCESS,
  GET_ALL_REFERRALS_ERROR,
} from '../Actions/action.index';
import * as Constants from '../../utils/Constants';
import http from '../../http';

export const getallreferall = (data) => {
  return (dispatch) => {
    dispatch({type: GET_ALL_REFERRALS_START});
    return http
      .post(Constants.API_URL_GET_ALL_REFERRALS, data)
      .then((res) => {
        console.log('<<<<<<<<<<');
        console.log(res);
        dispatch({
          type: GET_ALL_REFERRALS_SUCCESS,
          payload: res,
        });
        return Promise.resolve(res);
      })
      .catch((err) => {
        console.log('upload post getallreferall : ', err);
        dispatch({
          type: GET_ALL_REFERRALS_ERROR,
        });
        return Promise.reject();
      });
  };
};
