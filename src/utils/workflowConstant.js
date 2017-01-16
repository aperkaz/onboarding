const _ = require('lodash');


const workFlowsWithTransitions = [{
  'name': 'OnboardingEmail',
  'transitions':[{
	  'name': 'quoued',
      'allowed': ['sent', 'read', 'loaded', 'onboarded', 'bounced']
	},{
	  'name': 'sent',
      'allowed': ['read', 'loaded', 'onboarded']
	},{
	  'name': 'read',
      'allowed': ['loaded', 'onboarded']
	},{
	  'name': 'loaded',
      'allowed': ['onboarded']
	},{
	  'name': 'onboarded',
      'allowed': []
	},{
	  'name': 'bounced',
      'allowed': ['sent', 'read', 'loaded', 'onboarded']
	}]
}]


function getWorkflowTypes() {
  let listOfWorkflows = _.map(workFlowsWithTransitions, function(workflow){
    return workflow.name;
  });
  return listOfWorkflows;
}

function getPossibleTransitions(workflowType, currentState){
 let workflowIndex = _.findKey(workFlowsWithTransitions, { 'name': workflowType});
 let transitionIndex = _.findKey(workFlowsWithTransitions[workflowIndex].transitions, { 'name': currentState});
  return workFlowsWithTransitions[workflowIndex].transitions[transitionIndex].allowed;
}

exports.getWorkflowTypes = getWorkflowTypes;
exports.getPossibleTransitions = getPossibleTransitions;