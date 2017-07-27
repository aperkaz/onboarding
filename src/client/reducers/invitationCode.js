export default function invitationCode(state = {}, action) {
  switch (action.type) {
    case "CAMPAIGN_CREATE_INVITATION_CODE":
      console.log(action.payload.invitationCode);
      return action.payload.invitationCode;
    default:
      return null;
  }
}