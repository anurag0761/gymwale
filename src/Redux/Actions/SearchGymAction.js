import {
  SEARCH_GYM_ERROR,
  SEARCH_GYM_START,
  SEARCH_GYM_SUCCESS,
} from './action.index';
import * as Constants from '../../utils/Constants';
import http from '../../http';

export const SearchGymaction = (data) => {
  return (dispatch) => {
    dispatch({type: SEARCH_GYM_START});
    return http
      .post(Constants.API_URL_GYM_SEARCH, data)
      .then((res) => {
       
        dispatch({
          type: SEARCH_GYM_SUCCESS,
          payload: res,
        });
        return Promise.resolve(res);
      })
      .catch((err) => {
        console.log('upload post error searchgym : ', err);
        dispatch({
          type: SEARCH_GYM_ERROR,
        });
        return Promise.reject();
      });
  };
};
