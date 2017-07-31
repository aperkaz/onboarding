export default function invitationCode(state = null, action) {
  switch (action.type) {
    case "CAMPAIGN_CREATE_INVITATION_CODE":
      return action.payload.invitationCode;
    default:
      return state;
  }
}