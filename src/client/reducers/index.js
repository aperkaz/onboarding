import campaignList from './campaigns';
import campaignContactList from './campaignContacts';
import currentService from './currentService';
import notification from './notification';
import formReducer from './form';

const campaignsReducer = {
  form: formReducer,
  campaignList,
  campaignContactList,
  notification,
  currentService
};

export default campaignsReducer;

