import {applyMiddleware, createStore} from 'redux';
import thunk from 'redux-thunk';
import {persistStore, persistReducer} from 'redux-persist';
import rootReducer from './Reducer';

// const reducerPersist = persistReducer(persistConfig, rootReducer);
const middlewares = [thunk];
export const Store = createStore(rootReducer, applyMiddleware(...middlewares));
export const Persistor = persistStore(Store);
