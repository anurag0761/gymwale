import { FETCH_QUOTES_ERROR,FETCH_QUOTES_START,FETCH_QUOTES_SUCCESS } from '../Actions/action.index';

const initialState = {
  isLoading: false,
  success: false,
  error: false,
  quotes: [],
};
export default function (state = initialState, action) {
  switch (action.type) {
      case 'FETCH_QUOTES_START':
          return {
              ...state,
              isLoading: true,
              quotes: action.payload
            };
            case 'FETCH_QUOTES_SUCCESS':
                
           
      return {
        ...state,
        quotes: action.payload,
        isLoading: false,
        success: true,
      };
    case 'FETCH_QUOTES_ERROR':
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
