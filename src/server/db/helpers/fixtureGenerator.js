const _ = require('lodash');
const faker = require('faker');

const getModelSchema = (modelName, dbInstance) => {
    return _.values(dbInstance.models[modelName].tableAttributes).reduce( (previous, current) => {
        previous[current.fieldName] = { dataType: current.type.constructor.key, allowNull: current.allowNull, length: current.type.options && current.type.options.length};
        return previous;
    }, {});
}

const mapFieldTypeToFakerType = {
    'STRING': _ => faker.random.alphaNumeric(faker.random.number({min:3, max:14})),
    'DATE': _ => faker.date.past(2),
    'UUID': _ => faker.random.uuid(),
    'BIGINT': _ => faker.random.number({min:1, max: 60000000})
}

const generateFixtures = (amountToGenerate, modelName, dbInstance, overrideValue = {}) => {
    overrideValue = _.merge(overrideValue, { id: null})
    let modelSchema = getModelSchema(modelName, dbInstance);
    return Array(_.toInteger(amountToGenerate)).fill().map((undef, i) => _.mapValues(modelSchema, (value, index) => _.includes(_.keys(overrideValue),index) ? overrideValue[index] : mapFieldTypeToFakerType[value.dataType]()));
}


module.exports = generateFixtures;