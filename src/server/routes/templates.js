const Promise = require('bluebird');
const Handlebars = require('handlebars');
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

    this.db.models.Template.findAll({ customerId : customerId })
        .then(templates => res.json(templates))
        .catch(e => res.status(400).json({ message : e.message }));
}

TemplateWebApi.prototype.sendTemplate = function(req, res)
{
    const templateId = req.params.templateId;

    this.db.models.Template.findById(templateId).then(template =>
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
    const where = { id : templateId, customerId : customerId };

    this.db.models.Template.findOne({ where }).then(template =>
    {
        const compiled = Handlebars.compile(template.content);
        const result = compiled(templatePreviewData);

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

    this.db.models.Template.findOne({ id : templateId, customerId : customerId }).then(existing =>
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

    this.db.models.Template.destroy({ where: { id : templateId } })
        .then(() => res.status(202).json(true))
        .catch(e => res.status(400).json({ message : e.message }));
}
