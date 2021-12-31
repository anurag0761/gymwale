import {
  ASSIGN_TO_MEMBER_ERROR,
  ASSIGN_TO_MEMBER_START,
  ASSIGN_TO_MEMBER_SUCCESS,
} from '../Actions/action.index';
import * as Constants from '../../utils/Constants';

import http from '../../http';

export const assignToMember = (data) => {
  return (dispatch) => {
    dispatch({type: ASSIGN_TO_MEMBER_START});
    return http
      .post(Constants.API_URL_ASSIGN_WORKOUT, data)
      .then((res) => {
        //   let gymServices = "";

        dispatch({
          type: ASSIGN_TO_MEMBER_SUCCESS,
          payload: res,
        });
        return Promise.resolve(res);
      })
      .catch((err) => {
        console.log('upload post assigntoMember : ', err);
        dispatch({
          type: ASSIGN_TO_MEMBER_ERROR,
        });
        return Promise.reject();
      });
  };
};
