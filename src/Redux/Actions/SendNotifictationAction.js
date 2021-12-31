import {
    SEND_NOTIFICATION_START,
    SEND_NOTIFICATION_ERROR,
    SEND_NOTIFICATION_SUCCESS,
  } from './action.index';
  import * as Constants from '../../utils/Constants';
  import http from '../../http';
  
  export const sendNotification = (data) => {
    return (dispatch) => {
      dispatch({type: SEND_NOTIFICATION_START});
      return http
        .post(Constants.API_URL_SEND_NOTIFICATION_TO_MEMBER, data)
        .then((res) => {
          console.log('=SENDnoTIFICATION===================================');
          console.log(res);
          console.log('====SENDnoTIFICATION================================');
          dispatch({
            type: SEND_NOTIFICATION_SUCCESS,
            payload: res,
          });
          return Promise.resolve(res);
        })
        .catch((err) => {
          console.log('upload post error SEND_NOTIFICATION : ', err);
          dispatch({
            type: SEND_NOTIFICATION_ERROR,
          });
          return Promise.reject();
        });
    };
  };
  