import {
  ADD_WORKOUT_ERROR,
  ADD_WORKOUT_START,
  ADD_WORKOUT_SUCCESS,
} from '../Actions/action.index';
import * as Constants from '../../utils/Constants';

import http from '../../http';

export const addWorkout = (data, apiURL) => {
  return (dispatch) => {
    dispatch({type: ADD_WORKOUT_START});
    return http
      .post(apiURL, data)
      .then((res) => {
        dispatch({
          type: ADD_WORKOUT_SUCCESS,
          payload: res,
        });
        return Promise.resolve(res);
      })
      .catch((err) => {
        console.log('upload post addworoutoredit : ', err);
        dispatch({
          type: ADD_WORKOUT_ERROR,
        });
        return Promise.reject();
      });
  };
};
