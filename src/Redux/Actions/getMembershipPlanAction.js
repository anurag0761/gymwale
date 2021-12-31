import {
  GET_MEMBERSHIP_PLANS_ERROR,
  GET_MEMBERSHIP_PLANS_START,
  GET_MEMBERSHIP_PLANS_SUCCESS,
} from '../Actions/action.index';
import * as Constants from '../../utils/Constants';

import http from '../../http';

export const getPlanMembership = () => {
  return (dispatch) => {
     
    dispatch({type: GET_MEMBERSHIP_PLANS_START});

    return http
      .get(Constants.API_URL_GET_MEMBERSHIP_PLANS)
      .then((res) => {
      //     console.log('........')
      //  console.log(res)
        dispatch({
          type: GET_MEMBERSHIP_PLANS_SUCCESS,
          payload: res,
        });
        return Promise.resolve(res);
      })
      .catch((err) => {
        console.log('upload post getplan : ', err);
        dispatch({
          type: GET_MEMBERSHIP_PLANS_ERROR,
        });
        return Promise.reject();
      });
  };
};
