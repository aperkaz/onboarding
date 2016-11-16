import { routerStateReducer as router } from 'redux-router';
import { combineReducers } from 'redux';

import campaignList from './campaigns';
import serviceRegistry from './serviceRegistry';
import notification from './notification';
import formReducer  from './form';

export default combineReducers({
  router,
  form: formReducer,
  campaignList,
  notification,
  serviceRegistry
});
