import {
  FETCH_EXCERCISE_LIST_START,
  FETCH_EXCERCISE_LIST_SUCCESS,
  FETCH_EXCERCISE_LIST_ERROR,
} from '../Actions/action.index';
import * as Constants from '../../utils/Constants';

import http from '../../http';

export const fetchExerciseList = (data) => {
  return (dispatch) => {
    dispatch({type: FETCH_EXCERCISE_LIST_START});
    return http
      .get(Constants.API_URL_EXERCISES_LIST)
      .then((res) => {
     

        dispatch({
          type: FETCH_EXCERCISE_LIST_SUCCESS,
          payload: res,
        });
        return Promise.resolve(res);
      })
      .catch((err) => {
        console.log('upload post API_URL_EXERCISES_LIST : ', err);
        dispatch({
          type: FETCH_EXCERCISE_LIST_ERROR,
        });
        return Promise.reject();
      });
  };
};
