import { MEMBER_ALL_GYM_ERROR,MEMBER_ALL_GYM_START,MEMBER_ALL_GYM_SUCCESS,} from '../Actions/action.index';
import * as Constants from '../../utils/Constants';
import http from '../../http';

export const memberAllGym = (data) => {
  return (dispatch) => {
    dispatch({ type: MEMBER_ALL_GYM_START });
    return http
      .post(Constants.API_URL_MEMBER_ALL_GYM,data)
      .then((res) => { 
     
       
                   dispatch({
                    type: MEMBER_ALL_GYM_SUCCESS,
                    payload: res,
                  });
                  return Promise.resolve(res);    
      })
      .catch((err) => {
        console.log('upload post MEMBER_ALL_GYM : ', err);
        dispatch({
          type: MEMBER_ALL_GYM_ERROR,
        });
        return Promise.reject();
      });
  };}