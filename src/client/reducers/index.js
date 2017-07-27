import campaignList from './campaigns';
import campaignContactList from './campaignContacts';
import campaignsStatus from './campaignsStatus';
import currentService from './currentService';
import currentUserData from './currentUserData';
import notification from './notification';
import formReducer from './form';
import invitationCode from './invitationCode';

const campaignsReducer = {
  form: formReducer,
  campaignList,
  campaignsStatus,
  campaignContactList,
  notification,
  currentService,
  currentUserData,
  invitationCode
};

export default campaignsReducer;

