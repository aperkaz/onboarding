import request from 'superagent-bluebird-promise';

export function resetState() {
    return function (dispatch, getState) {
        dispatch({
            type: "RESET_CAMPAIGN_INVITATION_CODE",
            payload: null,
            status: "INIT"
        });
    }
}

export function getInvitationCode(onChange) {
    return function (dispatch, getState) {
        let data = {
            type: 'multipleUse',
        }
        dispatch({
            type: "SEND_ASK_FOR_CAMPAIGN_INVITATION_CODE",
            payload: false,
            status: "IN_PROGRESS"
        });
        return request.get(`${getState().currentService.location}/api/campaigns/create/getInvitationCode`)
        .set('Accept', 'application/json')
        .end((err, result) => {
            const data = result.body[0];
            onChange(data.invitationCode);
            dispatch({
                type: "CAMPAIGN_CREATE_INVITATION_CODE",
                payload: data.invitationCode,
                status: "FINISHED"
            });
        });
    }
}