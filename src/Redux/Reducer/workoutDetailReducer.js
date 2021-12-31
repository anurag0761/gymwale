import {
  WORKOUT_DETAIL_ERROR,
  WORKOUT_DETAIL_SUCCESS,
  WORKOUT_DETAIL_START,
} from '../Actions/action.index';

const initialState = {
  isLoading: false,
  success: false,
  error: false,
  data: [],
};
export default function (state = initialState, action) {
  switch (action.type) {
    case WORKOUT_DETAIL_START:
      return {
        ...state,
        isLoading: true,
      };
    case WORKOUT_DETAIL_SUCCESS:
      return {
        ...state,
        data: action.payload,
        isLoading: false,
        success: true,
      };
    case WORKOUT_DETAIL_ERROR:
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
