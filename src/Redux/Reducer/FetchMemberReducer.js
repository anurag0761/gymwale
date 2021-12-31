import { FETCH_MEMBERS_START,FETCH_MEMBERS_SUCCESS,FETCH_MEMBERS_ERROR } from '../Actions/action.index';

import _ from 'lodash';

const initialState = {
  isLoading: false,
  success: false,
  error: false,
  gymMember: [],
};
export default function (state = initialState, action) {
  switch (action.type) {
    case FETCH_MEMBERS_START:
      return {
        ...state,
        isLoading: true,
      };
    case FETCH_MEMBERS_SUCCESS:
      return {
        ...state,
        gymMember: action.payload,
        isLoading: false,
        success: true,
      };
    case FETCH_MEMBERS_ERROR:
      return {
        ...state,
        ...action.payload,
        isLoading: false,
        error: true,
        success: false,
      };
    default:
      return state;
  }
}
