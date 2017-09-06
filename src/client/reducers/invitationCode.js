let initialState = {
  code: null,
  status: "INIT"
}

export default function invitationCode(state = initialState, action) {
  switch (action.type) {
    case "RESET_CAMPAIGN_INVITATION_CODE":
      return {
        code: action.payload,
        status: action.status
      }
    case "SEND_ASK_FOR_CAMPAIGN_INVITATION_CODE":
      return {
        code: action.payload,
        status: action.status
      }
    case "CAMPAIGN_CREATE_INVITATION_CODE":
      return {
        code: action.payload,
        status: action.status
      }
    default:
      return state;
  }
}