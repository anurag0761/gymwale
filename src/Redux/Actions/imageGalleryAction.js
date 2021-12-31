import { UPLOADGALLERY_ERROR,UPLOADGALLERY_START,UPLOADGALLERY_SUCCESS,
    FETCH_UPLOADGALLERY_START,FETCH_UPLOADGALLERY_SUCCESS,FETCH_UPLOADGALLERY_ERROR,
    DELETE_UPLOADGALLERY_START,
    DELETE_UPLOADGALLERY_SUCCESS,
    DELETE_UPLOADGALLERY_ERROR,
 } from '../Actions/action.index';
import * as Constants from '../../utils/Constants';
import http from '../../http';

export const addgallery = (data) => {
  return (dispatch) => {
    dispatch({ type: UPLOADGALLERY_START });
    return http
      .post(Constants.API_URL_GYM_UPLOAD_GALLERY_IMAGE,data)
      .then((res) => { 
     console.log('=addgalery===================================');
     console.log(res);
     console.log('====addgalery================================');
       
                   dispatch({
                    type: UPLOADGALLERY_SUCCESS,
                    addgallerypayload: res,
                  });
                  return Promise.resolve(res);    
      })
      .catch((err) => {
        console.log('upload post galleryadd : ', err);
        dispatch({
          type: UPLOADGALLERY_ERROR,
        });
        return Promise.reject();
      });
  };}



  export const fetchgallery= (data) => {
    return (dispatch) => {
      dispatch({ type: FETCH_UPLOADGALLERY_START });
      return http
        .post(Constants.API_URL_GYM_GALLERY_IMAGE,data)
        .then((res) => { 
           
                     dispatch({
                      type: FETCH_UPLOADGALLERY_SUCCESS,
                      payload: res,
                    });
                    return Promise.resolve(res);    
        })
        .catch((err) => {
          console.log('upload post galleryfetch : ', err);
          dispatch({
            type: FETCH_UPLOADGALLERY_ERROR,
          });
          return Promise.reject();
        });
    };}



    export const deletegallery= (data) => {
        return (dispatch) => {
          dispatch({ type: DELETE_UPLOADGALLERY_START });
          return http
            .post(Constants.API_URL_GYM_REMOVE_GALLERY_IMAGE,data)
            .then((res) => { 
                console.log('%%%%%%%%%%%%delete%%%%%%%%%%%%%%')
                console.log(res)
                console.log('%%%%%%%%%%%%delete%%%%%%%%%%%%%%')
                         dispatch({
                          type: DELETE_UPLOADGALLERY_SUCCESS,
                          payload: res,
                        });
                        return Promise.resolve(res);    
            })
            .catch((err) => {
              console.log('upload post gallerydelete : ', err);
              dispatch({
                type: DELETE_UPLOADGALLERY_ERROR,
              });
              return Promise.reject();
            });
        };}
    
    



