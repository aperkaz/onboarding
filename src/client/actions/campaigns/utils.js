import _ from 'lodash';

/**
 * Converts dates from queries to iso date format
 * @param params
 * @returns converted params
 */
export function prepareParams(params) {
  let result = { ...params };
  if (!_.isUndefined(params.startsOn) && !_.isNull(params.startsOn)) {
    result['startsOn'] = params.startsOn.toISOString()
  }
  if (!_.isUndefined(params.endsOn) && !_.isNull(params.endsOn)) {
    result['endsOn'] = params.endsOn.toISOString()
  }
  return result;
}
