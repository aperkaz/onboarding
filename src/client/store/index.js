import { createStore, applyMiddleware, compose } from 'redux';
import thunkMiddleware from 'redux-thunk';
import redirectIfUnauthorized from './middleware/redirectToLogin';
import { combineReducers } from 'redux';
import campaignsReducer from '../reducers';

const finalCreateStore = compose(
  applyMiddleware(
    thunkMiddleware, 
    redirectIfUnauthorized
  )
)(createStore);

export default function configureStore(initialState) {
  return finalCreateStore(combineReducers(campaignsReducer), initialState)
}
