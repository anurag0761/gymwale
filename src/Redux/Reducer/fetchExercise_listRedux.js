import {
  FETCH_EXCERCISE_LIST_START,
  FETCH_EXCERCISE_LIST_SUCCESS,
  FETCH_EXCERCISE_LIST_ERROR,
} from '../Actions/action.index';

const initialState = {
  isLoading: false,
  success: false,
  error: false,
  data: [],
};
export default function (state = initialState, action) {
  switch (action.type) {
    case FETCH_EXCERCISE_LIST_START:
      return {
        ...state,
        isLoading: true,
      };
    case FETCH_EXCERCISE_LIST_SUCCESS:
      return {
        ...state,
        data: action.payload,
        isLoading: false,
        success: true,
      };
    case FETCH_EXCERCISE_LIST_ERROR:
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
