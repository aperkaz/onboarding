const Promise = require('bluebird');
const Handlebars = require('handlebars');
const extend = require('extend');
const templatePreviewData = require('./config/template-preview-data.json');

module.exports = function(app, db)
{
    const api = new TemplateWebApi(db);

    app.get('/api/templates/:customerId', (...args) => api.sendTemplates(...args));
    app.get('/api/templates/:customerId/:templateId', (...args) => api.sendTemplate(...args));
    app.get('/api/templates/:customerId/:templateId/preview', (...args) => api.renderTemplate(...args));
    app.post('/api/templates/:customerId', (...args) => api.createTemplate(...args));
    app.put('/api/templates/:customerId/:templateId', (...args) => api.updateTemplate(...args));
    app.delete('/api/templates/:customerId/:templateId', (...args) => api.deleteTemplate(...args));
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
    const templateId = req.params.templateId;
    const customerId = req.params.customerId;
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
    const customerId = req.params.customerId;
    const templateId = req.params.templateId;
    const where = {
        id : templateId,
        '$or' : [{ customerId }, { customerId : null }]
    };

    Promise.all([
        this.db.models.Template.findOne({ where }),
        req.opuscapita.serviceClient.get('customer', `/api/customers/${customerId}`).spread(c => c)
    ])
    .spread((template, customer) =>
    {
        const localPreviewData = extend(true, { }, templatePreviewData);
        localPreviewData.customer = customer;
        localPreviewData.externalUrl = 'http://' + req.headers['host'] + '/onboarding';
        localPreviewData.blobUrl = 'http://' + req.headers['host'] + '/blob';

        const compiled = template && template.content && Handlebars.compile(template.content);
        const result = (compiled && compiled(localPreviewData)) || '';

        res.set('Content-Type', 'text/html').send(result);
    });
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
    const templateId = req.params.templateId;
    const customerId = req.params.customerId;
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
    const templateId = req.params.templateId;
    const where = { id : templateId, customerId };

    this.db.models.Template.destroy({ where })
        .then(() => res.status(202).json(true))
        .catch(e => res.status(400).json({ message : e.message }));
}
