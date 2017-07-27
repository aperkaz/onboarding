import request from 'superagent-bluebird-promise';

export function getInvitationCode() {
    return function (dispatch, getState) {
        let data = {
            type: 'multipleUse',
        }
        request.get(`${getState().currentService.location}/api/campaigns/create/getInvitationCode`)
        .set('Accept', 'application/json')
        .end((err, result) => {
            console.log(result);
            dispatch({
                type: "CAMPAIGN_CREATE_INVITATION_CODE",
                payload: result.body[0]
            });
        });
    }
}