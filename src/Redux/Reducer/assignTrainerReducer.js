import {
  ASSIGN_TRAINER_START,
  ASSIGN_TRAINER_SUCCESS,
  ASSIGN_TRAINER_ERROR,
} from '../Actions/action.index';

const initialState = {
  isLoading: false,
  success: false,
  error: false,
  data: [],
};
export default function (state = initialState, action) {
  switch (action.type) {
    case ASSIGN_TRAINER_START:
      return {
        ...state,
        isLoading: true,
      };
    case ASSIGN_TRAINER_SUCCESS:
      return {
        ...state,
        data: action.payload,
        isLoading: false,
        success: true,
      };
    case ASSIGN_TRAINER_ERROR:
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
