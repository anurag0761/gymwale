import { FETCH_USERTYPECOUNT_ERROR,FETCH_USERTYPECOUNT_SUCCESS,FETCH_USERTYPECOUNT_START } from '../Actions/action.index';
import * as Constants from '../../utils/Constants';
import http from '../../http';

export const fetchusertype = (data) => {
  return (dispatch) => {
    dispatch({ type: FETCH_USERTYPECOUNT_START });
    return http
      .post(Constants.API_URL_GET_USERTYPE_COUNT,data)
      .then((res) => {   
          
                   dispatch({
                    type: FETCH_USERTYPECOUNT_SUCCESS,
                    payload: res,
                  });
                  return Promise.resolve(res);    
      })
      .catch((err) => {
        console.log('upload post usertype: ', err);
        dispatch({
          type: FETCH_USERTYPECOUNT_ERROR,
        });
        return Promise.reject();
      });
  };}

