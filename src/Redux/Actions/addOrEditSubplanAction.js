import { ADDOREDIT_SUBSCRIPTIONPLAN_ERROR,ADDOREDIT_SUBSCRIPTIONPLAN_START,ADDOREDIT_SUBSCRIPTIONPLAN_SUCCESS } from '../Actions/action.index';
import * as Constants from '../../utils/Constants';

import http from '../../http';

export const addOrEditSubplanAction = (apiURL,data) => {
  return (dispatch) => {
      
   
    dispatch({ type: ADDOREDIT_SUBSCRIPTIONPLAN_START });
    return http
      .post(apiURL, data)
      .then((res) => {
      
        
        dispatch({
          type: ADDOREDIT_SUBSCRIPTIONPLAN_SUCCESS,
          payload: res,
          
        });
        return Promise.resolve(res);
      })
      .catch((err) => {
        console.log('upload post ADDOREDIT : ', err);
        dispatch({
          type: ADDOREDIT_SUBSCRIPTIONPLAN_ERROR,
        });
        return Promise.reject();
      });
  };}

