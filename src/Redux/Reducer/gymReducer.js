import {
  FETCH_GYMLIST_ERROR, FETCH_GYMLIST_START, FETCH_GYMLIST_SUCCESS, FETCH_ADDGYM_ERROR, FETCH_ADDGYM_START, FETCH_ADDGYM_SUCCESS,
  FETCH_EDITGYM_START, FETCH_EDITGYM_SUCCESS, FETCH_EDITGYM_ERROR
} from '../Actions/action.index';
const initialState = {
  isLoading: false,
  success: false,
  error: false,
  isLoadingadd: false,
  successadd: false,
  erroradd: false,
  gymlist: [],
  gymadd:[],
  gymedit:[]
};
export default function (state = initialState, action) {
  switch (action.type) {
    case FETCH_GYMLIST_START:
      return {
        ...state,
        isLoading: true,
      };
    case FETCH_GYMLIST_SUCCESS:
      
      return {
        
        ...state,
        gymlist: action.gymlistpayload,
        isLoading: false,
        success: true,
      };
    case FETCH_GYMLIST_ERROR:
      return {
        ...state,
        ...action.gymlistpayload,
        isLoading: false,
        error: true,
        success: false,
      };



      case FETCH_ADDGYM_START:
      return {
        ...state,
        isLoading: true,
      };
    case FETCH_ADDGYM_SUCCESS:
    
      return {
        ...state,
        gymadd: action.payload,
        isLoading: false,
        success: true,
      };
    case FETCH_ADDGYM_ERROR:
      return {
        ...state,
        ...action.payload,
        isLoadingadd: false,
        erroradd: true,
        successadd: false,
      };



      case FETCH_EDITGYM_START:
        return {
          ...state,
          isLoading: true,
        };
      case FETCH_EDITGYM_SUCCESS:
      
        return {
          ...state,
          gymedit: action.editgympayload,
          isLoading: false,
          success: true,
        };
      case FETCH_EDITGYM_ERROR:
        return {
          ...state,
          ...action.payload,
          isLoadingadd: false,
          erroradd: true,
          successadd: false,
        };

    default:
      return state;
  }
}
