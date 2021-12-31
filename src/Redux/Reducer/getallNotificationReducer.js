import { FETCH_ALLNOTIFICATION_ERROR,
    FETCH_ALLNOTIFICATION_START,
    FETCH_ALLNOTIFICATION_SUCCESS,
    DELETE_NOTIFICATION_ERROR,
    DELETE_NOTIFICATION_START,
    DELETE_NOTIFICATION_SUCCESS } from '../Actions/action.index';
    
const initialState = {
  isLoading: false,
  success: false,
  error: false,
  allNotification: [],
  delete:[]
};
export default function (state = initialState, action) {
  switch (action.type) {
    case FETCH_ALLNOTIFICATION_START:
      return {
        ...state,
        isLoading: true,
      };
    case FETCH_ALLNOTIFICATION_SUCCESS:
        console.log(')))))))))reducer(((((((((((')
        console.log(action.payload)
        console.log(')))))))))reducer(((((((((((')
      return {
        ...state,
        allNotification: action.payload,
        isLoading: false,
        success: true,
      };
    case FETCH_ALLNOTIFICATION_ERROR:
      return {
        ...state,
        ...action.payload,
        isLoading: false,
        error: true,
        success: false,
      };



      case DELETE_NOTIFICATION_START:
      return {
        ...state,
        isLoading: true,
      };
    case DELETE_NOTIFICATION_SUCCESS:
    
      return {
        ...state,
        delete: action.payload,
        isLoading: false,
        success: true,
      };
    case DELETE_NOTIFICATION_ERROR:
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
