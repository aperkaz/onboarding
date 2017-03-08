const _ = require('lodash');


const workFlowsWithTransitions = [{
  'name': 'SupplierOnboarding',
  'transitions':[{
	  'name': 'queued',
    'allowed': ['queued', 'sending', 'sent', 'read', 'loaded', 'onboarded', 'bounced']
	},{
    'name': 'sending',
    'allowed': ['sending', 'sent', 'read', 'loaded', 'onboarded', 'bounced']
  },
  {
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