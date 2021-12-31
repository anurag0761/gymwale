import {
  ABOUT_COMMENT_START,
  ABOUT_COMMENT_SUCCESS,
  ABOUT_COMMENT_ERROR,
} from '../Actions/action.index';
import * as Constants from '../../utils/Constants';

import http from '../../http';

export const aboutcomment = (data) => {
  return (dispatch) => {
    dispatch({type: ABOUT_COMMENT_START});
    return http
      .post(Constants.API_URL_ADD_COMMENT, data)
      .then((res) => {
        dispatch({
          type: ABOUT_COMMENT_SUCCESS,
          payload: res,
        });
        return Promise.resolve(res);
      })
      .catch((err) => {
        console.log('upload post about_comment : ', err);
        dispatch({
          type: ABOUT_COMMENT_ERROR,
        });
        return Promise.reject();
      });
  };
};
