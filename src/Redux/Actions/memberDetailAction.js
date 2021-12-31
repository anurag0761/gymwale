import {
  FETCH_MEMBERDETAIL_ERROR,
  FETCH_MEMBERDETAIL_START,
  FETCH_MEMBERDETAIL_SUCCESS,
} from '../Actions/action.index';
import * as Constants from '../../utils/Constants';
import http from '../../http';

export const fetchMemberDetails = (data) => {
  return (dispatch) => {
    dispatch({type: FETCH_MEMBERDETAIL_START});
    return http
      .post(Constants.API_URL_GET_GYM_MEMBER_DETAIL, data)
      .then((res) => {
        dispatch({
          type: FETCH_MEMBERDETAIL_SUCCESS,
          payload: res,
        });
        return Promise.resolve(res);
      })
      .catch((err) => {
        console.log('upload post fetchMemberDetails : ', err);
        dispatch({
          type: FETCH_MEMBERDETAIL_ERROR,
        });
        return Promise.reject();
      });
  };
};
