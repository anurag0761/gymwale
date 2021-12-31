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
import http from '../../http';

export const fetchAllCity = () => {
  return (dispatch) => {
    dispatch({type: FETCH_ALLCITY_START});
    return http
      .get(Constants.API_GET_CITIES)
      .then((res) => {
        // let data = JSON.parse(res);
        // console.log('RES::::::::::::::::::::::::::::::::::::::::', res.cities);

        dispatch({
          type: FETCH_ALLCITY_SUCCESS,
          payload: res,
        });
        return Promise.resolve(res);
      })
      .catch((err) => {
        console.log('upload post getallcity : ', err);
        dispatch({
          type: FETCH_ALLCITY_ERROR,
        });
        return Promise.reject();
      });
  };
};
export const fetchAllStates = () => {
  return (dispatch) => {
    dispatch({type: FETCH_ALLSTATES_START});
    return http
      .get(Constants.API_URL_GET_ALL_STATE)
      .then((res) => {
        dispatch({
          type: FETCH_ALLSTATES_SUCCESS,
          payload: res,
        });
        return Promise.resolve(res);
      })
      .catch((err) => {
        console.log('upload post getallstates : ', err);
        dispatch({
          type: FETCH_ALLSTATES_ERROR,
        });
        return Promise.reject();
      });
  };
};

export const fetchAllCountry = () => {
  return (dispatch) => {
    dispatch({type: FETCH_ALLCOUNTRY_START});
    return http
      .get(Constants.API_URL_GET_ALL_COUNTRY)
      .then((res) => {
        dispatch({
          type: FETCH_ALLCOUNTRY_SUCCESS,
          payload: res,
        });
        return Promise.resolve(res);
      })
      .catch((err) => {
        console.log('upload post getallCOUNTRY: ', err);
        dispatch({
          type: FETCH_ALLCOUNTRY_ERROR,
        });
        return Promise.reject();
      });
  };
};
