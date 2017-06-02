const router = require('express').Router();
const generateFixtures = require('../helpers/fixtureGenerator');

module.exports = (db) => {
    router.get('/:num([1-9][0-9]{0,})', (req, res) => {

        let fixtures = generateFixtures(req.params.num, 'CampaignContact', db);
        
        db.models.CampaignContact.bulkCreate(fixtures)
        .then((response) => {
            res.status(200).json(response);
        })
        .catch((error) => {
            res.status(500).json(error);
        });
    });

    router.delete('/clean', (req, res) => {
        db.models.CampaignContact.destroy({
            where: {}
        })
        .then( (deletedRecords) => {
            res.status(200).json(deletedRecords);
        })
        .catch( (error) => {
            res.status(500).json(error);
        });
    });

    router.get('/campaign/:id(\\S{1,})/:num([1-9][0-9]{0,})/:status(\\w{1,})', (req, res) => {
        let fixtures = generateFixtures(req.params.num, 'CampaignContact', db, { campaignId: req.params.id, status: req.params.status });
        
        db.models.CampaignContact.bulkCreate(fixtures)
        .then((response) => {
            res.status(200).json(response);
        })
        .catch((error) => {
            res.status(500).json(error);
        });
    });

    return router;
}