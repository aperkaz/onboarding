const _ = require('lodash');


/**
 * Comparator for 2 population items
 * in case 1st item depends on second one - the first item should go later in the array
 *
 * @param populateConfig1
 * @param populateConfig2
 * @return -1, 0, 1
 */
const configComparator = (populateConfig1, populateConfig2) => {
  if (!_.isUndefined(populateConfig1.dependsOn) && populateConfig1.dependsOn === populateConfig2.model) {
    return 1;
  } else if(!_.isUndefined(populateConfig2.dependsOn) && populateConfig2.dependsOn === populateConfig1.model) {
    return -1;
  }

  return 0;
};

/**
 * Sorts the array of population configs in order they sould be executed
 * we use bubble-sort (not quick one) to be sure that each item is compared with all items
 * (it is not required in more fast sort algorithms, but is required for graph-traversing)
 *
 * @param array of population congis {
 *  model: "model_name",
 *  data: [{...},{...},{...}],
 *  dependsOn: "another_model_name"
 * }
 * @return sorted array of population configs
 */
module.exports = function(array) {
  const arrayCopy = _.clone(array);
  for(var i = 0; i < _.size(arrayCopy); i++) {
    for(var j = 0; j < _.size(arrayCopy); j++) {
      if(configComparator(arrayCopy[i], arrayCopy[j]) < 0) {
        let tmp = arrayCopy[i];
        arrayCopy[i] = arrayCopy[j];
        arrayCopy[j] = tmp;
      }
    }
  }
  return arrayCopy;
};
