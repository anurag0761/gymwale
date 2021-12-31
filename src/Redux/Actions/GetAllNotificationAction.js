import { FETCH_ALLNOTIFICATION_ERROR,
    FETCH_ALLNOTIFICATION_START,
    FETCH_ALLNOTIFICATION_SUCCESS,
    DELETE_NOTIFICATION_ERROR,
    DELETE_NOTIFICATION_START,
    DELETE_NOTIFICATION_SUCCESS } from '../Actions/action.index';

import * as Constants from '../../utils/Constants';
import http from '../../http';


  export const getallnotification = (data) => {
    return (dispatch) => {
      dispatch({ type: FETCH_ALLNOTIFICATION_START });
      return http
        .post(Constants.API_URL_GET_NOTIFICATIONS,data)
        .then((res) => {
                   
                     dispatch({
                      type: FETCH_ALLNOTIFICATION_SUCCESS,
                      payload: res,
                    });
                    return Promise.resolve(res);    
        })
        .catch((err) => {
          console.log('upload post getallcity : ', err);
          dispatch({
            type: FETCH_ALLNOTIFICATION_ERROR,
          });
          return Promise.reject();
        });
    };}


    export const deleteNotification = (data) => {
        return (dispatch) => {
          dispatch({ type: DELETE_NOTIFICATION_START });
          return http
            .post(Constants.API_URL_DELETE_NOTIFICATION_TEXT,data)
            .then((res) => {
                         
                         dispatch({
                          type: DELETE_NOTIFICATION_SUCCESS,
                          payload: res,
                        });
                        return Promise.resolve(res);    
            })
            .catch((err) => {
              console.log('upload post DELETENOTIFICATION : ', err);
              dispatch({
                type: DELETE_NOTIFICATION_ERROR,
              });
              return Promise.reject();
            });
        };}
      
  
  

