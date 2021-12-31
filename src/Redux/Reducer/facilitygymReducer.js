import { FETCH_GYMFACILITY_START,FETCH_GYMFACILITY_SUCCESS,FETCH_GYMFACILITY_ERROR,
  FACILITY_UPDATE_START,
  FACILITY_UPDATE_SUCCESS,
  FACILITY_UPDATE_ERROR, } from '../Actions/action.index';

const initialState = {
  isLoading: false,
  success: false,
  error: false,
  gymfacility: [],
  updatefacility: [],
};
export default function (state = initialState, action) {
  switch (action.type) {


    case FACILITY_UPDATE_START:
      return {
        ...state,
        isLoading: true,
      };
    case FACILITY_UPDATE_SUCCESS:
      return {
        ...state,
        updatefacility: action.payload,
        isLoading: false,
        success: true,
      };
    case FACILITY_UPDATE_ERROR:
      return {
        ...state,
        ...action.payload,
        isLoading: false,
        error: true,
        success: false,
      };



    case FETCH_GYMFACILITY_START:
      return {
        ...state,
        isLoading: true,
      };
    case FETCH_GYMFACILITY_SUCCESS:
      return {
        ...state,
        gymfacility: action.payload,
        isLoading: false,
        success: true,
      };
    case FETCH_GYMFACILITY_ERROR:
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
