import {
  ABOUT_COMMENT_START,
  ABOUT_COMMENT_SUCCESS,
  ABOUT_COMMENT_ERROR,
} from '../Actions/action.index';

const initialState = {
  isLoading: false,
  success: false,
  error: false,
  data: [],
};
export default function (state = initialState, action) {
  switch (action.type) {
    case ABOUT_COMMENT_START:
      return {
        ...state,
        isLoading: true,
      };
    case ABOUT_COMMENT_SUCCESS:
      return {
        ...state,
        data: action.payload,
        isLoading: false,
        success: true,
        error: false,
      };
    case ABOUT_COMMENT_ERROR:
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
