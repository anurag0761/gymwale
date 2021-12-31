import { FETCH_MEMBERS_START,FETCH_MEMBERS_SUCCESS,FETCH_MEMBERS_ERROR } from '../Actions/action.index';
import * as Constants from '../../utils/Constants';

import http from '../../http';


export const fetchMembers = (data) => {
  return (dispatch) => {
    dispatch({ type: FETCH_MEMBERS_START });
 
    return http
      .post(Constants.API_URL_GET_ALL_MEMBERS, data)
      .then((res) => {
      
                   dispatch({
                    type: FETCH_MEMBERS_SUCCESS,
                    payload: res,
                  });
                  return Promise.resolve(res);
  
      })
      .catch((err) => {
        console.log('upload post GYMMEMBER : ', err);
        dispatch({
          type: FETCH_MEMBERS_ERROR,
        });
        return Promise.reject();
      });
  };}

