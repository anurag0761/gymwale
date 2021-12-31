import {
    BODY_PART_LIST_ERROR,
    BODY_PART_LIST_START,
    BODY_PART_LIST_SUCCESS,
  } from '../Actions/action.index';
  import * as Constants from '../../utils/Constants';
  
  import http from '../../http';
  
  export const BodyPartList = () => {
    return (dispatch) => {
      dispatch({type: BODY_PART_LIST_START});
      return http
        .get(Constants.API_URL_BODY_PARTS_LIST)
        .then((res) => {
           
          dispatch({
            type: BODY_PART_LIST_SUCCESS,
            payload: res,
          });
          return Promise.resolve(res);
        })
        .catch((err) => {
          console.log('upload post BODY_PART_LIST : ', err);
          dispatch({
            type: BODY_PART_LIST_ERROR,
          });
          return Promise.reject();
        });
    };
  };
  