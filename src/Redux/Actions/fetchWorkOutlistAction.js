import {
  FETCH_WORKOUT_LIST_START,
  FETCH_WORKOUT_LIST_SUCCESS,
  FETCH_WORKOUT_LIST_ERROR,
  DELETE_WORKOUT_START,
  DELETE_WORKOUT_SUCCESS,
  DELETE_WORKOUT_ERROR,
} from '../Actions/action.index';
import * as Constants from '../../utils/Constants';

import http from '../../http';

export const fetchWorkoutList = (data) => {
  return (dispatch) => {
    dispatch({type: FETCH_WORKOUT_LIST_START});
    return http
      .post(Constants.API_URL_WORKOUT_LIST, data)
      .then((res) => {
        dispatch({
          type: FETCH_WORKOUT_LIST_SUCCESS,
          payload: res,
        });
        return Promise.resolve(res);
      })
      .catch((err) => {
        console.log('upload post FETCH_WORKOUT_LIST : ', err);
        dispatch({
          type: FETCH_WORKOUT_LIST_ERROR,
        });
        return Promise.reject();
      });
  };
};


export const deleteWorkout = (data) => {
  return (dispatch) => {
    dispatch({type: DELETE_WORKOUT_START});
    return http
      .post(Constants.API_URL_DELETE_WORKOUT, data)
      .then((res) => {
        dispatch({
          type: DELETE_WORKOUT_SUCCESS,
          payload: res,
        });
        return Promise.resolve(res);
      })
      .catch((err) => {
        console.log('upload post API_URL_DELETE_WORKOUT : ', err);
        dispatch({
          type: DELETE_WORKOUT_ERROR,
        });
        return Promise.reject();
      });
  };
};
