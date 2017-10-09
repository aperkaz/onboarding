let statuses = require('./statuses.json')

function getDBStatuses(status){
    return statuses.UIstatuses[status];
}

function getUIStatus(status){
    return statuses.DBstatuses[status];
}

function isInDBstatuses(status){
    if (status in statuses.DBstatuses) {
        return true;
    } else {
        return false;
    }
}

function isInUIstatuses(status){
    if (status in statuses.UIstatuses) {
        return true;
    } else {
        return false;
    }
}

module.exports = {
    getDBStatuses: getDBStatuses,
    getUIStatus: getUIStatus,
    isInDBstatuses: isInDBstatuses,
    isInUIstatuses: isInUIstatuses
}
