const _ = require('lodash');

const configComparator = (populateConfig1, populateConfig2) => {
  if (!_.isUndefined(populateConfig1.dependsOn) && populateConfig1.dependsOn === populateConfig2.model) {
    return 1;
  } else if(!_.isUndefined(populateConfig2.dependsOn) && populateConfig2.dependsOn === populateConfig1.model) {
    return -1;
  }

  return 0;
};

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
