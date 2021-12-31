import {
  OWNER_PAYTM_START,
  OWNER_PAYTM_SUCCESS,
  OWNER_PAYTM_ERROR,
} from '../Actions/action.index';

const initialState = {
  isLoading: false,
  success: false,
  error: false,
  ownerPaytm: [],
};
export default function (state = initialState, action) {
  switch (action.type) {
    case OWNER_PAYTM_START:
      return {
        ...state,
        isLoading: true,
      };
    case OWNER_PAYTM_SUCCESS:
      return {
        ...state,
        ownerPaytm: action.payload,
        isLoading: false,
        success: true,
        error: false,
      };
    case OWNER_PAYTM_ERROR:
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
