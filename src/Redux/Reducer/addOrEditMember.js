import { ADDOREDIT_MEMBER_ERROR,ADDOREDIT_MEMBER_START,ADDOREDIT_MEMBER_SUCCESS,
    ADDOREDIT_MEMBERSTAFF_ERROR,ADDOREDIT_MEMBERSTAFF_START,ADDOREDIT_MEMBERSTAFF_SUCCESS } from '../Actions/action.index';

const initialState = {
  isLoading: false,
  success: false,
  error: false,
  data: [],
  isLoadingstaff: false,
  successstaff: false,
  errorstaff: false,
  datastaff: [],
};
export default function (state = initialState, action) {
  switch (action.type) {
    case ADDOREDIT_MEMBER_START:
      return {
        ...state,
        isLoading: true,
      };
    case ADDOREDIT_MEMBER_SUCCESS:
      
      return {
        ...state,
        data: action.payload,
        isLoading: false,
        success: true,
      };
    case ADDOREDIT_MEMBER_ERROR:
      return {
        ...state,
        ...action.payload,
        isLoading: false,
        error: true,
        success: false,
      };
      










      case ADDOREDIT_MEMBERSTAFF_START:
      return {
        ...state,
        isLoadingstaff: true,
      };
    case ADDOREDIT_MEMBERSTAFF_SUCCESS:
      
      return {
        ...state,
        datastaff: action.payload,
        isLoadingstaff: false,
        successstaff: true,
      };
    case ADDOREDIT_MEMBERSTAFF_ERROR:
      return {
        ...state,
        ...action.payload,
        isLoadingstaff: false,
        errorstaff: true,
        successstaff: false,
      };
    default:
      return state;
  }
}
