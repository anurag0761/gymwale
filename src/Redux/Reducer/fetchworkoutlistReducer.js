import {
  FETCH_WORKOUT_LIST_START,
  FETCH_WORKOUT_LIST_SUCCESS,
  FETCH_WORKOUT_LIST_ERROR,
  DELETE_WORKOUT_START,
  DELETE_WORKOUT_SUCCESS,
  DELETE_WORKOUT_ERROR,
} from '../Actions/action.index';

const initialState = {
  isLoading: false,
  success: false,
  error: false,
  data: [],
  deleteworkout: [],
};
export default function (state = initialState, action) {
  switch (action.type) {
    case DELETE_WORKOUT_START:
      return {
        ...state,
        isLoading: true,
      };
    case DELETE_WORKOUT_SUCCESS:
      return {
        ...state,
        deleteworkout: action.payload,
        isLoading: false,
        success: true,
      };
    case DELETE_WORKOUT_ERROR:
      return {
        ...state,
        ...action.payload,
        isLoading: false,
        error: true,
        success: false,
      };

    case FETCH_WORKOUT_LIST_START:
      return {
        ...state,
        isLoading: true,
      };
    case FETCH_WORKOUT_LIST_SUCCESS:
      return {
        ...state,
        data: action.payload,
        isLoading: false,
        success: true,
      };
    case FETCH_WORKOUT_LIST_ERROR:
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
