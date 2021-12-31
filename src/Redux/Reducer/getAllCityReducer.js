import {
  FETCH_ALLCITY_ERROR,
  FETCH_ALLCITY_START,
  FETCH_ALLCITY_SUCCESS,
  FETCH_ALLSTATES_START,
  FETCH_ALLSTATES_SUCCESS,
  FETCH_ALLSTATES_ERROR,
  FETCH_ALLCOUNTRY_START,
  FETCH_ALLCOUNTRY_SUCCESS,
  FETCH_ALLCOUNTRY_ERROR,
} from '../Actions/action.index';
import * as Constants from '../../utils/Constants';

const initialState = {
  isLoading: false,
  success: false,
  error: false,
  allCity: [],
  allStates: [],
  allcountry: [],
};
export default function (state = initialState, action) {
  switch (action.type) {
    case FETCH_ALLCOUNTRY_START:
      return {
        ...state,
        isLoading: true,
      };
    case FETCH_ALLCOUNTRY_SUCCESS:
      return {
        ...state,
        allcountry: action.payload,
        isLoading: false,
        success: true,
      };
    case FETCH_ALLCOUNTRY_ERROR:
      return {
        ...state,
        ...action.payload,
        isLoading: false,
        error: true,
        success: false,
      };
      case FETCH_ALLCITY_START:
      return {
        ...state,
        isLoading: true,
      };
    case FETCH_ALLCITY_SUCCESS:
      return {
        ...state,
        allCity: action.payload,
        isLoading: false,
        success: true,
      };
    case FETCH_ALLCITY_ERROR:
      return {
        ...state,
        ...action.payload,
        isLoading: false,
        error: true,
        success: false,
      };

    case FETCH_ALLSTATES_START:
      return {
        ...state,
        isLoading: true,
      };
    case FETCH_ALLSTATES_SUCCESS:
      return {
        ...state,
        allStates: action.payload,
        isLoading: false,
        success: true,
      };
    case FETCH_ALLSTATES_ERROR:
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
