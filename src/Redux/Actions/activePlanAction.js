import {
  ACTIVE_PLAN_START,
  ACTIVE_PLAN_SUCCESS,
  ACTIVE_PLAN_ERROR,
} from '../Actions/action.index';
import * as Constants from '../../utils/Constants';

import http from '../../http';

export const activeplan = (data) => {
  return (dispatch) => {
    dispatch({type: ACTIVE_PLAN_START});
    return http
      .post(Constants.API_URL_ACTIVE_PLANS, data)
      .then((res) => {
        console.log('========activeplan============================');
        console.log(res);
        console.log('============activeplan========================');
        dispatch({
          type: ACTIVE_PLAN_SUCCESS,
          payload: res,
        });
        return Promise.resolve(res);
      })
      .catch((err) => {
        console.log('upload post activeplan : ', err);
        dispatch({
          type: ACTIVE_PLAN_ERROR,
        });
        return Promise.reject();
      });
  };
};
