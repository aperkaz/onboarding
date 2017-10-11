const _ = require('lodash');


const workFlowsWithTransitions = [{
  'name': 'eInvoiceSupplierOnboarding',
  'transitions': [{
	  'name': 'queued',
      'allowed': ['queued', 'sending', 'sent', 'read', 'loaded', 'onboarded', 'bounced']
	},{
      'name': 'sending',
      'allowed': ['sending', 'sent', 'read', 'loaded', 'onboarded', 'bounced']
    },{
	  'name': 'sent',
      'allowed': ['sent', 'read', 'loaded', 'onboarded']
	},{
	  'name': 'read',
      'allowed': ['read', 'loaded', 'onboarded']
	},{
	  'name': 'loaded',
      'allowed': ['loaded','onboarded']
	},{
	  'name': 'onboarded',
      'allowed': ['onboarded']
	},{
	  'name': 'bounced',
      'allowed': ['bounced', 'sent', 'read', 'loaded', 'onboarded']
	},{
      'name': 'invitationGenerated',
      'allowed': ['sending', 'sent', 'onboarded']
    }]
}]


function getWorkflowTypes() {
  return _.map(workFlowsWithTransitions, function(workflow) {
    return workflow.name;
  });
}

function getPossibleTransitions(workflowType, currentState) {
  let workflowIndex = _.findKey(workFlowsWithTransitions, { 'name': workflowType });
  let transitionIndex = _.findKey(workFlowsWithTransitions[workflowIndex].transitions, { 'name': currentState });

  let transition = workFlowsWithTransitions[workflowIndex] && workFlowsWithTransitions[workflowIndex].transitions[transitionIndex];
  return transition ? transition.allowed : [];
}

exports.getWorkflowTypes = getWorkflowTypes;
exports.getPossibleTransitions = getPossibleTransitions;
