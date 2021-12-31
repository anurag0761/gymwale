import { UPLOADGALLERY_ERROR,UPLOADGALLERY_START,UPLOADGALLERY_SUCCESS,
    FETCH_UPLOADGALLERY_START,FETCH_UPLOADGALLERY_SUCCESS,FETCH_UPLOADGALLERY_ERROR,
    DELETE_UPLOADGALLERY_START,
    DELETE_UPLOADGALLERY_SUCCESS,
    DELETE_UPLOADGALLERY_ERROR,
 } from '../Actions/action.index';
    
  const initialState = {
    isLoadingfetch: false,
    successfetch: false,
    errorfetch: false,
    isLoadingadd: false,
    successadd: false,
    erroradd: false,
    gallery: [],
    fetchgallery:[],
    deletedata:[]
    
  };
  export default function (state = initialState, action) {
    switch (action.type) {
      case UPLOADGALLERY_START:
        return {
          ...state,
          isLoading: true,
        };
      case UPLOADGALLERY_SUCCESS:
        
        return {
          
          ...state,
          gallery: action.addgallerypayload,
          isLoading: false,
          success: true,
        };
      case UPLOADGALLERY_ERROR:
        return {
          ...state,
          ...action.addgallerypayload,
          isLoading: false,
          error: true,
          success: false,
        };

        case FETCH_UPLOADGALLERY_START:
        return {
          ...state,
          isLoading: true,
        };
      case FETCH_UPLOADGALLERY_SUCCESS:
      
        return {
          ...state,
          fetchgallery: action.payload,
          isLoading: false,
          success: true,
        };
      case FETCH_UPLOADGALLERY_ERROR:
        return {
          ...state,
          ...action.payload,
          isLoading: false,
          error: true,
          success: false,
        };
  
  
  
        case DELETE_UPLOADGALLERY_START:
          return {
            ...state,
            isLoading: true,
          };
        case DELETE_UPLOADGALLERY_SUCCESS:
        
          return {
            ...state,
            deletedata: action.payload,
            isLoading: false,
            success: true,
          };
        case DELETE_UPLOADGALLERY_ERROR:
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
  
