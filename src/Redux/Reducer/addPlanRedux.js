import {
  ADD_PLANS_ERROR,
  ADD_PLANS_START,
  ADD_PLANS_SUCCESS,
} from '../Actions/action.index';

const initialState = {
  isLoading: false,
  success: false,
  error: false,
  addplan: [],
};
export default function (state = initialState, action) {
  switch (action.type) {
    case ADD_PLANS_START:
      return {
        ...state,
        isLoading: true,
      };
    case ADD_PLANS_SUCCESS:
      return {
        ...state,
        addplan: action.payload,
        isLoading: false,
        success: true,
        error: false,
      };
    case ADD_PLANS_ERROR:
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
