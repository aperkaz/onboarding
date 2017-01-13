import campaignList from './campaigns';
import campaignContactList from './campaignContacts';
import serviceRegistry from './serviceRegistry';
import notification from './notification';
import formReducer from './form';

const campaignsReducer = {
  form: formReducer,
  campaignList,
  campaignContactList,
  notification,
  serviceRegistry
};

export default campaignsReducer;

