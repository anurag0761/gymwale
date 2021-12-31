import {
  OWNER_PAYTM_START,
  OWNER_PAYTM_SUCCESS,
  OWNER_PAYTM_ERROR,
} from '../Actions/action.index';
import * as Constants from '../../utils/Constants';
import http from '../../http';

export const fetchOwnerpaytm = (data) => {
  return (dispatch) => {
    dispatch({type: OWNER_PAYTM_START});
    return http
      .post(Constants.API_URL_WEBSITE_OWNER_PAYTM,data)
      .then((res) => {
      
        dispatch({
          type: OWNER_PAYTM_SUCCESS,
          payload: res,
        });
        return Promise.resolve(res);
      })
      .catch((err) => {
        console.log('upload post OWNERPAYTM : ', err);
        dispatch({
          type: OWNER_PAYTM_ERROR,
        });
        return Promise.reject();
      });
  };
};
