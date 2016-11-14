import { routerStateReducer as router } from 'redux-router';
import { combineReducers } from 'redux';

import campaign from './campaigns';
import serviceRegistry from './serviceRegistry';
import notification from './notification';
import { reducer as formReducer } from 'redux-form';

export default combineReducers({
  router,
  form: formReducer,
  campaign,
  notification,
  serviceRegistry
});
