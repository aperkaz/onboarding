let statuses = require('./statuses.json')

export function getDBStatuses(status){
    return statuses.UIstatuses[status];
}

export function getUIStatus(status){
    return statuses.DBstatuses[status];
}

export function isInDBstatuses(status){
    if (status in statuses.DBstatuses) {
        return true;
    } else {
        return false;
    }
}

export function isInUIstatuses(status){
    if (status in statuses.UIstatuses) {
        return true;
    } else {
        return false;
    }
}
