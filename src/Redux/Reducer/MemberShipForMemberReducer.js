import {
  MEMBERSHIP_FOR_MEMBER_START,
  MEMBERSHIP_FOR_MEMBER_SUCCESS,
  MEMBERSHIP_FOR_MEMBER_ERROR,
} from '../Actions/action.index';

const initialState = {
  isLoading: false,
  success: false,
  error: false,
  data: [],
};
export default function (state = initialState, action) {
  switch (action.type) {
    case MEMBERSHIP_FOR_MEMBER_START:
      return {
        ...state,
        isLoading: true,
      };
    case MEMBERSHIP_FOR_MEMBER_SUCCESS:
      return {
        ...state,
        data: action.payload,
        isLoading: false,
        success: true,
        error: false,
      };
    case MEMBERSHIP_FOR_MEMBER_ERROR:
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
