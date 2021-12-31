import {
  WORKOUT_DETAIL_START,
  WORKOUT_DETAIL_SUCCESS,
  WORKOUT_DETAIL_ERROR,
} from '../Actions/action.index';
import * as Constants from '../../utils/Constants';

import http from '../../http';

export const fetchWorkoutDetails = (data) => {
  return (dispatch) => {
    dispatch({type: WORKOUT_DETAIL_START});
    return http
      .post(Constants.API_URL_GET_WORKOUT_DETAILS, data)
      .then((res) => {
        dispatch({
          type: WORKOUT_DETAIL_SUCCESS,
          payload: res,
        });
        return Promise.resolve(res);
      })
      .catch((err) => {
        console.log('upload post WORKOUT_DETAIL : ', err);
        dispatch({
          type: WORKOUT_DETAIL_ERROR,
        });
        return Promise.reject();
      });
  };
};
