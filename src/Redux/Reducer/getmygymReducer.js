import {
  GET_MY_GYM_START,
  GET_MY_GYM_SUCCESS,
  GET_MY_GYM_ERROR,
} from '../Actions/action.index';

const initialState = {
  isLoading: false,
  success: false,
  error: false,
  data: [],
};
export default function (state = initialState, action) {
  switch (action.type) {
    case GET_MY_GYM_START:
      return {
        ...state,
        isLoading: true,
      };
    case GET_MY_GYM_SUCCESS:
      return {
        ...state,
        data: action.payload,
        isLoading: false,
        success: true,
      };
    case GET_MY_GYM_ERROR:
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
