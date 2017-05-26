const router = require('express').Router();
const fixtureCampaign = require('./campaign.fixture');
const fixtureContact = require('./campaignContract.fixture');

module.exports = (db) => {
    router.use('/campaigns', fixtureCampaign(db));
    router.use('/contacts', fixtureContact(db));

    return router;
}
