import {
  ADD_PLANS_ERROR,
  ADD_PLANS_START,
  ADD_PLANS_SUCCESS,
} from '../Actions/action.index';
import * as Constants from '../../utils/Constants';

import http from '../../http';

export const addplanaction = (data) => {
  return (dispatch) => {
    dispatch({type: ADD_PLANS_START});
    return http
      .post(Constants.API_URL_ADD_PLANS, data)
      .then((res) => {
    
        //   let gymServices = "";

        dispatch({
          type: ADD_PLANS_SUCCESS,
          payload: res,
        });
        return Promise.resolve(res);
      })
      .catch((err) => {
        console.log('upload post addplan : ', err);
        dispatch({
          type: ADD_PLANS_ERROR,
        });
        return Promise.reject();
      });
  };
};
