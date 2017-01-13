import _ from 'lodash';
import moment from 'moment';

/**
 * Converts dates from queries to iso date format
 * @param params
 * @returns converted params
 */
export function prepareParams(params) {
  let result = { ...params };
  if (!_.isUndefined(params.startsOn) && !_.isNull(params.startsOn)) {
    //we need date without time and timezone (f.e. '2017-01-04T00:00:00+00:00')
    result['startsOn'] = moment(
      _.replace(moment(params.startsOn).format(), /(\+|-)\d{2}:\d{2}/, '+00:00')
    ).toDate().toISOString();
  }
  if (!_.isUndefined(params.endsOn) && !_.isNull(params.endsOn)) {
    result['endsOn'] = moment(
      _.replace(moment(params.endsOn).format(), /(\+|-)\d{2}:\d{2}/, '+00:00')
    ).toDate().toISOString();
  }
  return result;
}
