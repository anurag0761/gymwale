import {
  ALL_BALANCE_START,
  ALL_BALANCE_SUCCESS,
  ALL_BALANCE_ERROR,
} from '../Actions/action.index';

const initialState = {
  isLoading: false,
  success: false,
  error: false,
  allbalance: [],
  pindata: [],
};
export default function (state = initialState, action) {
  switch (action.type) {
    case ALL_BALANCE_START:
      return {
        ...state,
        isLoading: true,
      };
    case ALL_BALANCE_SUCCESS:
      return {
        ...state,
        allbalance: action.payload,
        isLoading: false,
        success: true,
      };
    case ALL_BALANCE_ERROR:
      return {
        ...state,
        ...action.payload,
        isLoading: false,
        error: true,
        success: false,
      };

    case 'BALANCESHEET_PIN_START':
      return {
        ...state,
        isLoading: true,
      };
    case 'BALANCESHEET_PIN_SUCCESS':
      return {
        ...state,
        pindata: action.payload,
        isLoading: false,
        success: true,
      };
    case 'BALANCESHEET_PIN_ERROR':
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
