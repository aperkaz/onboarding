const Promise = require('bluebird');

module.exports = function(app, db)
{
    const api = new TemplateWebApi(db);

    app.get('/api/templates/:customerId', (req, res) => api.sendTemplates(req, res));
    app.get('/api/templates/:customerId/:templateId', (req, res) => api.sendTemplate(req, res));
    app.post('/api/templates/:customerId', (req, res) => api.createTemplate(req, res));
    app.put('/api/templates/:customerId/:templateId', (req, res) => api.updateTemplate(req, res));
    app.delete('/api/templates/:customerId/:templateId', (req, res) => api.deleteTemplate(req, res));
}

function TemplateWebApi(db)
{
    this.db = db;
}

TemplateWebApi.prototype.sendTemplates = function(req, res)
{
    const customerId = req.params.customerId;

    this.db.models.Template.findAll({ customerId : customerId }).then(templates => res.json(templates))
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

TemplateWebApi.prototype.createTemplate = function(req, res)
{
    const customerId = req.params.customerId;
    const input = req.body;

    input.customerId = customerId;
    input.files = JSON.stringify(input.files);

    this.db.models.Template.create(input).then(result => res.status(201).json(result))
        .catch(e => res.status(400).json({ message : e.message }));
}

TemplateWebApi.prototype.updateTemplate = function(req, res)
{
    const templateId = req.params.templateId;
    const customerId = req.params.customerId;
    const input = req.body;

    this.db.models.Template.findById(templateId).then(existing =>
    {
        input.id = templateId;
        input.customerId = customerId;
        input.files = JSON.stringify(input.files);

        if(existing)
            return this.db.models.Template.update(input).then(() => res.status(202).json(input));
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
