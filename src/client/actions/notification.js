import {SHOW_NOTIFICATION, REMOVE_NOTIFICATION} from '../constants/notification';

export function showNotification(message, level = 'info', autoDismiss = 2, dismissible = true) {
    return {
        type: SHOW_NOTIFICATION,
        message,
        level,
        autoDismiss,
        dismissible
    }
}

export function removeNotification() {
    return {
        type: REMOVE_NOTIFICATION
    }
}