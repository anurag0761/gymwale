import {
  PAYMENT_SETTING_START,
  PAYMENT_SETTING_SUCCESS,
  PAYMENT_SETTING_ERROR,
} from '../Actions/action.index';
import * as Constants from '../../utils/Constants';
import http from '../../http';

export const PaymentSetting = (data) => {
  return (dispatch) => {
    dispatch({type: PAYMENT_SETTING_START});
    return http
      .post(Constants.API_URL_ADD_PAYMENT_SETTING, data)
      .then((res) => {
        console.log('>>>>>>>>>>>paymnet>>>>>>>>>>');
        console.log(res);
        console.log('>>>>>>>>>>>paymnet>>>>>>>>>>');
        dispatch({
          type: PAYMENT_SETTING_SUCCESS,
          payload: res,
        });
        return Promise.resolve(res);
      })
      .catch((err) => {
        console.log('upload post payment_setting : ', err);
        dispatch({
          type: PAYMENT_SETTING_ERROR,
        });
        return Promise.reject();
      });
  };
};
