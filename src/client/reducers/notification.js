import _ from 'lodash';
import { SHOW_NOTIFICATION, REMOVE_NOTIFICATION } from '../constants/notification'

export default function notification(state = { position: 'tc' }, action) {
  switch (action.type) {
    case SHOW_NOTIFICATION:
      return {
        ...state,
        message: action.message,
        level: action.level,
        autoDismiss: action.autoDismiss,
        dismissible: action.dismissible,
        uid: _.uniqueId('notification_')
      };
    case REMOVE_NOTIFICATION:
      return {
        uid: state.uid,
        position: state.position
      };
    default:
      return state;
  }
}
