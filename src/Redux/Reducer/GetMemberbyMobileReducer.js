import {
  GET_MEMBER_BY_MOBILE_START,
  GET_MEMBER_BY_MOBILE_SUCCESS,
  GET_MEMBER_BY_MOBILE_ERROR, 
} from '../Actions/action.index';

const initialState = {
  isLoading: false,
  success: false,
  error: false,
  data: [],
};
export default function (state = initialState, action) {
  switch (action.type) {
    case GET_MEMBER_BY_MOBILE_START:
      return {
        ...state,
        isLoading: true,
      };
    case GET_MEMBER_BY_MOBILE_SUCCESS:
      return {
        ...state,
        data: action.payload,
        isLoading: false,
        success: true,
      };
    case GET_MEMBER_BY_MOBILE_ERROR:
      return {
        ...state,

        isLoading: false,
        error: true,
        success: false,
      };

    default:
      return state;
  }
}
