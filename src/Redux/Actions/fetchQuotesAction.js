import {
  FETCH_QUOTES_ERROR,
  FETCH_QUOTES_START,
  FETCH_QUOTES_SUCCESS,
} from '../Actions/action.index';
import * as Constants from '../../utils/Constants';
import http from '../../http';

export const fetchquotes = () => {
  return (dispatch) => {
    dispatch({type: 'FETCH_QUOTES_START'});
    return http
      .get(Constants.API_URL_MOTIVATIONAL_QUOTES)
      .then((res) => {
      
        dispatch({
          type: 'FETCH_QUOTES_SUCCESS',
          payload: res,
        });
        return Promise.resolve(res);
      })
      .catch((err) => {
        console.log('upload post fetchquotes : ', err);
        dispatch({
          type: 'FETCH_QUOTES_ERROR',
        });
        return Promise.reject();
      });
  };
};
