import {
    FETCH_ALL_ATTENDANCE_START,
    FETCH_ALL_ATTENDANCE_SUCCESS,
    FETCH_ALL_ATTENDANCE_ERROR,
  } from '../Actions/action.index';
  import * as Constants from '../../utils/Constants';
  
  import http from '../../http';
  
  export const fetchAllAttendance = (data) => {
    return (dispatch) => {
      dispatch({type: FETCH_ALL_ATTENDANCE_START});
      return http
        .post(Constants.API_URL_GET_ALL_ATTENDANCE,data)
        .then((res) => {
          console.log('======attend==============================');
          console.log(res);
          console.log('=======attend=============================');
  
          dispatch({
            type: FETCH_ALL_ATTENDANCE_SUCCESS,
            payload: res,
          });
          return Promise.resolve(res);
        })
        .catch((err) => {
          console.log('upload post attendance : ', err);
          dispatch({
            type: FETCH_ALL_ATTENDANCE_ERROR,
          });
          return Promise.reject();
        });
    };
  };
  