import {
  FETCH_MEMBERDETAIL_START,
  FETCH_MEMBERDETAIL_SUCCESS,
  FETCH_MEMBERDETAIL_ERROR,
} from '../Actions/action.index';

const initialState = {
  isLoading: false,
  success: false,
  error: false,
  data: [],
};
export default function (state = initialState, action) {
  switch (action.type) {
    case FETCH_MEMBERDETAIL_START:
      return {
        ...state,
        isLoading: true,
      };
    case FETCH_MEMBERDETAIL_SUCCESS:
      return {
        ...state,
        data: action.payload,
        isLoading: false,
        success: true,
        error: false,
      };
    case FETCH_MEMBERDETAIL_ERROR:
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
