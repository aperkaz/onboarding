const Promise = require('bluebird');
const extend = require('extend');
const Templates = require('../api/Templates');

module.exports = function(app, db)
{
    const api = new TemplateWebApi(db);

    app.get('/api/templates/:customerId', (...args) => api.sendTemplates(...args));
    app.get('/api/templates/:customerId/:templateId', (...args) => api.sendTemplate(...args));
    app.get('/api/templates/:customerId/:templateId/preview', (...args) => api.renderTemplate(...args));
    app.post('/api/templates/:customerId', (...args) => api.createTemplate(...args));
    app.put('/api/templates/:customerId/:templateId', (...args) => api.updateTemplate(...args));
    app.delete('/api/templates/:customerId/:templateId', (...args) => api.deleteTemplate(...args));

    app.get('/public/landingpage/:tenantId/:campaignId', (...args) => api.renderPublicTemplate('landingpage', ...args));
    app.get('/public/landingpage/:tenantId/:campaignId/:contactId', (...args) => api.renderPublicTemplate('landingpage', ...args));

    app.get('/public/email/:tenantId/:campaignId', (...args) => api.renderPublicTemplate('email', ...args));
    app.get('/public/email/:tenantId/:campaignId/:contactId', (...args) => api.renderPublicTemplate('email', ...args));
}

function TemplateWebApi(db)
{
    this.db = db;
}

TemplateWebApi.prototype.sendTemplates = function(req, res)
{
    const customerId = req.params.customerId;
    const where = { '$or' : [ { customerId }, { customerId : null } ] };

    this.db.models.Template.findAll({ where : where })
        .then(templates => res.json(templates))
        .catch(e => res.status(400).json({ message : e.message }));
}

TemplateWebApi.prototype.sendTemplate = function(req, res)
{
    const { templateId, customerId } = req.params;

    const where = {
        id : templateId,
        '$or' : [{ customerId }, { customerId : null }]
    };

    this.db.models.Template.findOne({ where }).then(template =>
    {
        if(template)
            res.json(template);
        else
            res.status(404).json({ message : 'The requested template could not be found.' });
    })
    .catch(e => res.status(400).json({ message : e.message }));
}

TemplateWebApi.prototype.renderTemplate = function(req, res)
{
    const { customerId, templateId } = req.params;
    const baseUrl = '//' + req.headers['host'];
    const templatesApi = new Templates(this.db, req.opuscapita.serviceClient);

    templatesApi.renderTemplatePreview({ templateId, customerId, baseUrl })
        .then(({ result, templateValues }) => res.set('Content-Type', 'text/html').send(result))
        .catch(e => res.status(400).json({ message : e.message }));
}

TemplateWebApi.prototype.renderPublicTemplate = function(type, req, res)
{
    const { tenantId, campaignId, contactId } = req.params;
    const customerId = tenantId.startsWith('c_') ? tenantId.substring(2) : tenantId;
    const transition = req.query.transition;
    const baseUrl = '//' + req.headers['host'];
    const invitationCode = req.query.invitationCode;
    const language = req.query.lang || req.cookies.lang;
    const templatesApi = new Templates(this.db, req.opuscapita.serviceClient);

    templatesApi.renderPublicTemplate({
        type, customerId, campaignId, contactId, transition, baseUrl, invitationCode, language
    })
    .then(({ result, templateValues }) =>
    {
        res.cookie('OPUSCAPITA_LANGUAGE', templateValues.language, { maxAge : 120000 });
        res.set('Content-Type', 'text/html').send(result);
    })
    .catch(e => res.status(400).json({ message : e.message }));
}

TemplateWebApi.prototype.createTemplate = function(req, res)
{
    const customerId = req.params.customerId;
    const input = req.body;

    input.customerId = customerId;

    this.db.models.Template.create(input).then(result => res.status(201).json(result))
        .catch(e => res.status(400).json({ message : e.message }));
}

TemplateWebApi.prototype.updateTemplate = function(req, res)
{
    const { templateId, customerId } = req.params;
    const input = req.body;
    const where = { id : templateId, customerId };

    this.db.models.Template.findOne({ where }).then(existing =>
    {
        input.id = templateId;
        input.customerId = customerId;

        const where = { where : { id : templateId } };

        if(existing)
            return this.db.models.Template.update(input, where).then(() => res.status(202).json(input));
        else
        res.status(404).json({ message : 'The requested template could not be found.' });
    })
    .catch(e => res.status(400).json({ message : e.message }));
}

TemplateWebApi.prototype.deleteTemplate = function(req, res)
{
    const { templateId, customerId } = req.params;
    const where = { id : templateId, customerId };

    this.db.models.Template.destroy({ where })
        .then(() => res.status(202).json(true))
        .catch(e => res.status(400).json({ message : e.message }));
}
