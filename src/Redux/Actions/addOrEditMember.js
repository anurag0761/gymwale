import {
  ADDOREDIT_MEMBER_ERROR,
  ADDOREDIT_MEMBER_START,
  ADDOREDIT_MEMBER_SUCCESS,
  ADDOREDIT_MEMBERSTAFF_ERROR,
  ADDOREDIT_MEMBERSTAFF_START,
  ADDOREDIT_MEMBERSTAFF_SUCCESS,
} from '../Actions/action.index';
import * as Constants from '../../utils/Constants';

import http from '../../http';

export const addOrEditMemberAction = (data) => {
  return (dispatch) => {
    dispatch({type: ADDOREDIT_MEMBER_START});
    return http
      .post(Constants.API_URL_ADD_OR_EDIT_MEMBER, data)
      .then((res) => {
        console.log('=====addOrEditMemberAction===============================');
        console.log(res);
        console.log('======addOrEditMemberAction==============================');
        dispatch({
          type: ADDOREDIT_MEMBER_SUCCESS,
          payload: res,
        });
        return Promise.resolve(res);
      })
      .catch((err) => {
        console.log('upload post ADDOREDITmember : ', err);
        dispatch({
          type: ADDOREDIT_MEMBER_ERROR,
        });
        return Promise.reject();
      });
  };
};

export const addOrEditMemberStaff = (data) => {
  return (dispatch) => {
    dispatch({type: ADDOREDIT_MEMBERSTAFF_START});
    return http
      .post(Constants.API_URL_ADD_OR_EDIT_MEMBER, data)
      .then((res) => {
        dispatch({
          type: ADDOREDIT_MEMBERSTAFF_SUCCESS,
          payload: res,
        });
        return Promise.resolve(res);
      })
      .catch((err) => {
        console.log('upload post ADDOREDITmember : ', err);
        dispatch({
          type: ADDOREDIT_MEMBERSTAFF_ERROR,
        });
        return Promise.reject();
      });
  };
};
