const router = require('express').Router();
const generateFixtures = require('../helpers/fixtureGenerator');

module.exports = (db) => {
    router.get('/:num([1-9][0-9]{0,})', (req, res) => {

        let fixtures = generateFixtures(req.params.num, 'Campaign', db);
        
        db.models.Campaign.bulkCreate(fixtures)
        .then((response) => {
            res.status(200).json(response);
        })
        .catch((error) => {
            res.status(500).json(error);
        });
    });

    router.delete('/clean', (req, res) => {
        db.models.Campaign.destroy({
            where: {}
        })
        .then( (deletedRecords) => {
            res.status(200).json(deletedRecords);
        })
        .catch( (error) => {
            res.status(500).json(error);
        });
    });

    return router;
}