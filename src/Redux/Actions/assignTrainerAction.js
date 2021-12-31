import {
  ASSIGN_TRAINER_ERROR,
  ASSIGN_TRAINER_START,
  ASSIGN_TRAINER_SUCCESS,
} from '../Actions/action.index';
import * as Constants from '../../utils/Constants';

import http from '../../http';

export const assignTrainer = (data) => {
  return (dispatch) => {
    dispatch({type: ASSIGN_TRAINER_START});
    return http
      .post(Constants.API_URL_ASSIGN_AS_TRAINER, data)
      .then((res) => {
        console.log('==trainer==================================');
        console.log(res);
        console.log('=====trainer===============================');
        dispatch({
          type: ASSIGN_TRAINER_SUCCESS,
          payload: res,
        });
        return Promise.resolve(res);
      })
      .catch((err) => {
        console.log('upload post API_URL_ASSIGN_AS_TRAINER : ', err);
        dispatch({
          type: ASSIGN_TRAINER_ERROR,
        });
        return Promise.reject();
      });
  };
};
