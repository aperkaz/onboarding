import campaignList from './campaigns';
import campaignContactList from './campaignContacts';
import campaignsStatus from './campaignsStatus';
import currentService from './currentService';
import currentUserData from './currentUserData';
import notification from './notification';
import formReducer from './form';

const campaignsReducer = {
  form: formReducer,
  campaignList,
  campaignsStatus,
  campaignContactList,
  notification,
  currentService,
  currentUserData
};

export default campaignsReducer;

