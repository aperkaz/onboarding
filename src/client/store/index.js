import { createStore, applyMiddleware, compose } from 'redux';
import { reduxReactRouter } from 'redux-router'
import { createHistory } from 'history';
import thunkMiddleware from 'redux-thunk';
import rootReducer from '../reducers';

const finalCreateStore = compose(
    reduxReactRouter({ createHistory }),
    applyMiddleware(
        thunkMiddleware
    )
)(createStore);

export default function configureStore(initialState) {
    return finalCreateStore(rootReducer, initialState)
}