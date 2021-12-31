import {
  ADD_WORKOUT_START,
  ADD_WORKOUT_SUCCESS,
  ADD_WORKOUT_ERROR,
} from '../Actions/action.index';

const initialState = {
  isLoading: false,
  success: false,
  error: false,
  data: [],
};
export default function (state = initialState, action) {
  switch (action.type) {
    case ADD_WORKOUT_START:
      return {
        ...state,
        isLoading: true,
      };
    case ADD_WORKOUT_SUCCESS:
      return {
        ...state,
        data: action.payload,
        isLoading: false,
        success: true,
        error: false,
      };
    case ADD_WORKOUT_ERROR:
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
