import {
  DELETE_MEMBER_START,
  DELETE_MEMBER_SUCCESS,
  DELETE_NOTIFICATION_ERROR,
} from '../Actions/action.index';
import * as Constants from '../../utils/Constants';

import http from '../../http';

export const deleteMember = (data) => {
  return (dispatch) => {
    dispatch({type: DELETE_MEMBER_START});
    return http
      .post(Constants.API_URL_DELETE_MEMBER, data)
      .then((res) => {
        console.log('=====ddddddddd===============================');
        console.log(res);
        console.log('======dddddddd==============================');
        console.log(res);
        dispatch({
          type: DELETE_MEMBER_SUCCESS,
          payload: res,
        });
        return Promise.resolve(res);
      })
      .catch((err) => {
        console.log('upload post deletemember : ', err);
        dispatch({
          type: DELETE_NOTIFICATION_ERROR,
        });
        return Promise.reject();
      });
  };
};
