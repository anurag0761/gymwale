import {
  MEMBERSHIP_FOR_MEMBER_START,
  MEMBERSHIP_FOR_MEMBER_SUCCESS,
  MEMBERSHIP_FOR_MEMBER_ERROR,
} from '../Actions/action.index';
import * as Constants from '../../utils/Constants';
import http from '../../http';

export const MembershipForMember = (data) => {
  return (dispatch) => {
    dispatch({type: MEMBERSHIP_FOR_MEMBER_START});
    return http
      .post(Constants.API_URL_MEMBERSHIP_FOR_MEMBER, data)
      .then((res) => {
        dispatch({
          type: MEMBERSHIP_FOR_MEMBER_SUCCESS,
          payload: res,
        });
        return Promise.resolve(res);
      })
      .catch((err) => {
        console.log('upload post membershipforMember : ', err);
        dispatch({
          type: MEMBERSHIP_FOR_MEMBER_ERROR,
        });
        return Promise.reject();
      });
  };
};
