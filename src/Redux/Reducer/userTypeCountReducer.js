import { FETCH_USERTYPECOUNT_ERROR,FETCH_USERTYPECOUNT_SUCCESS,FETCH_USERTYPECOUNT_START } from '../Actions/action.index';

const initialState = {
  isLoading: false,
  success: false,
  error: false,
  usertype: [],
};
export default function (state = initialState, action) {
  switch (action.type) {
    case FETCH_USERTYPECOUNT_START:
      return {
        ...state,
        isLoading: true,
      };
    case FETCH_USERTYPECOUNT_SUCCESS:
    
      return {
        ...state,
        usertype: action.payload,
        isLoading: false,
        success: true,
      };
    case FETCH_USERTYPECOUNT_ERROR:
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
