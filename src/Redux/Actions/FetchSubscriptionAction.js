import {
  FETCH_SUBSCRIPTION_ERROR,
  FETCH_SUBSCRIPTION_START,
  FETCH_SUBSCRIPTION_SUCCESS,
  DELETE_MEMBERSHIP_START,
  DELETE_MEMBERSHIP_SUCCESS,
  DELETE_MEMBERSHIP_ERROR,
} from '../Actions/action.index';
import * as Constants from '../../utils/Constants';

import http from '../../http';

export const FetchSubscriptionAction = (data) => {
  return (dispatch) => {
    dispatch({type: FETCH_SUBSCRIPTION_START});
    return http
      .post(Constants.API_URL_GET_ALL_MEMBERSHIP_PLANS, data)
      .then((res) => {
       
        dispatch({
          type: FETCH_SUBSCRIPTION_SUCCESS,
          payload: res,
        });
        return Promise.resolve(res);
      })
      .catch((err) => {
        console.log('upload post FETCHSUB : ', err);
        dispatch({
          type: FETCH_SUBSCRIPTION_ERROR,
        });
        return Promise.reject();
      });
  };
};

export const DeleteMembership = (data) => {
  return (dispatch) => {
    dispatch({type: DELETE_MEMBERSHIP_START});
    return http
      .post(Constants.API_URL_DELETE_MEMBERSHIP_PLAN, data)
      .then((res) => {
        dispatch({
          type: DELETE_MEMBERSHIP_SUCCESS,
          payload: res,
        });
        return Promise.resolve(res);
      })
      .catch((err) => {
        console.log('upload post deltemembership : ', err);
        dispatch({
          type: DELETE_MEMBERSHIP_ERROR,
        });
        return Promise.reject();
      });
  };
};
