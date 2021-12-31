import { FETCH_GYMFACILITY_START,FETCH_GYMFACILITY_SUCCESS,FETCH_GYMFACILITY_ERROR,
  FACILITY_UPDATE_START,
  FACILITY_UPDATE_SUCCESS,
  FACILITY_UPDATE_ERROR, } from '../Actions/action.index';
import * as Constants from '../../utils/Constants';

import http from '../../http';

export const facilityupdate = (data) => {
  return (dispatch) => {
    dispatch({ type: FACILITY_UPDATE_START });
    return http
      .post(Constants.API_URL_UPDATE_FACILITIES, data)
      .then((res) => {

         
      
        
             
                  
                   dispatch({
                    type: FACILITY_UPDATE_SUCCESS,
                    payload: res,
                  });
                  return Promise.resolve(res);

              
      })
      .catch((err) => {
        console.log('upload post FACILITYUPDATE : ', err);
        dispatch({
          type: FACILITY_UPDATE_ERROR,
        });
        return Promise.reject();
      });
  };}





  export const fetchGymFacility = (data) => {
    return (dispatch) => {
      dispatch({ type: FETCH_GYMFACILITY_START });
      return http
        .post(Constants.API_URL_GYM_FACILITIES, data)
        .then((res) => {
  
           
            let valid = res[Constants.KEY_VALID];
          //   let gymServices = "";
                if(valid) {
                     let gymFacilities = res[Constants.KEY_BODY];
                
                    
                     dispatch({
                      type: FETCH_GYMFACILITY_SUCCESS,
                      payload: gymFacilities,
                    });
                    return Promise.resolve(res);
  
                } 
        })
        .catch((err) => {
          console.log('upload post gymservices : ', err);
          dispatch({
            type: FETCH_GYMFACILITY_ERROR,
          });
          return Promise.reject();
        });
    };}
  
