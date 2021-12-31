import {
  GET_DASHBOARD_DETAIL_START,
  GET_DASHBOARD_DETAIL_SUCCESS,
  GET_DASHBOARD_DETAIL_ERROR,
} from '../Actions/action.index';
import * as Constants from '../../utils/Constants';
import http from '../../http';

export const getDashboardDetail = (data) => {
  console.log('====================================');
  console.log(data);
  console.log('====================================');
  return (dispatch) => {
    dispatch({type: GET_DASHBOARD_DETAIL_START});
    return http
      .post(Constants.API_URL_GET_DASHBOARD_DETAIL, data)
      .then((res) => {
     
        
        dispatch({
          type: GET_DASHBOARD_DETAIL_SUCCESS,
          payload: res,
        });
        return Promise.resolve(res);
      })
      .catch((err) => {
        console.log('upload post getallreferall : ', err);
        dispatch({
          type: GET_DASHBOARD_DETAIL_ERROR,
        });
        return Promise.reject();
      });
  };
};
