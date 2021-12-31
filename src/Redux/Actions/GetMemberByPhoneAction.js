import {
  GET_MEMBER_BY_MOBILE_START,
  GET_MEMBER_BY_MOBILE_SUCCESS,
  GET_MEMBER_BY_MOBILE_ERROR,
} from '../Actions/action.index';
import * as Constants from '../../utils/Constants';
import http from '../../http';

export const getMemberbyMobile = (data) => {
  return (dispatch) => {
    dispatch({type: GET_MEMBER_BY_MOBILE_START});
    return http
      .post(Constants.API_URL_GET_MEMBER_BY_MOBILE, data)
      .then((res) => {
        dispatch({
          type: GET_MEMBER_BY_MOBILE_SUCCESS,
          payload: res,
        });
        return Promise.resolve(res);
      })
      .catch((err) => {
        dispatch({
          type: GET_MEMBER_BY_MOBILE_ERROR,
        });
        return Promise.reject();
      });
  };
};
