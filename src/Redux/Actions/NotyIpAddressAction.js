import {
    NOTIAPI_START,
    NOTIAPI_SUCCESS,
    NOTIAPI_ERROR,
  } from '../Actions/action.index';
  import * as Constants from '../../utils/Constants';
  import http from '../../http';
  
  export const notificationApi = (data) => {
    return (dispatch) => {
      dispatch({type: NOTIAPI_START});
      return http
        .post(Constants.API_URL_NOTIFICATION_IP_ADDRESS, data)
        .then((res) => {
            
          dispatch({
            type: NOTIAPI_SUCCESS,
            payload: res,
          });
          return Promise.resolve(res);
        })
        .catch((err) => {
          console.log('upload post notifyapiaddress : ', err);
          dispatch({
            type: NOTIAPI_ERROR,
          });
          return Promise.reject();
        });
    };
  };
  