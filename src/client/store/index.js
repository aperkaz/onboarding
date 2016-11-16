import { createStore, applyMiddleware, compose } from 'redux';
import { reduxReactRouter } from 'redux-router'
import { createHistory } from 'history';
import thunkMiddleware from 'redux-thunk';
import rootReducer from '../reducers';

const finalCreateStore = compose(
  applyMiddleware(
    thunkMiddleware
  ),
  reduxReactRouter({ createHistory })
)(createStore);

export default function configureStore(initialState) {
  return finalCreateStore(rootReducer, initialState)
}
