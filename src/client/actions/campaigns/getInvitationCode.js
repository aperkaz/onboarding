import request from 'superagent-bluebird-promise';

export function getInvitationCode(onChange) {
    return function (dispatch, getState) {
        let data = {
            type: 'multipleUse',
        }
        return request.get(`${getState().currentService.location}/api/campaigns/create/getInvitationCode`)
        .set('Accept', 'application/json')
        .end((err, result) => {
            const data = result.body[0];
            onChange(data.invitationCode);
            dispatch({
                type: "CAMPAIGN_CREATE_INVITATION_CODE",
                payload: data
            });
        });
    }
}