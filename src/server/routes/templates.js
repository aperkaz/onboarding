const Promise = require('bluebird');

module.exports = function(app, db)
{
    const api = new TemplateWebApi(db);

    app.get('/api/templates', (req, res) => api.sendTemplates(req, res));
    app.get('/api/templates/:templateId', (req, res) => api.sendTemplate(req, res));
    app.post('/api/templates', (req, res) => api.createTemplate(req, res));
    app.put('/api/templates/:templateId', (req, res) => api.updateTemplate(req, res));
    app.delete('/api/templates/:templateId', (req, res) => api.deleteTemplate(req, res));
}

function TemplateWebApi(db)
{
    this.db = db;
}

TemplateWebApi.prototype.sendTemplates = function(req, res)
{}

TemplateWebApi.prototype.sendTemplate = function(req, res)
{
    const templateId = req.params.templateId;
}

TemplateWebApi.prototype.createTemplate = function(req, res)
{
    const input = req.body;

    input.files = JSON.stringify(input.files);

    this.db.models.Template.create(input).then(result => res.status(201).json(result))
        .catch(e => res.status(400).json({ message : e.message }));
}

TemplateWebApi.prototype.updateTemplate = function(req, res)
{
    const templateId = req.params.templateId;
    const input = req.body;

    this.db.models.Template.findById(templateId).then(existing =>
    {
        input.id = templateId;
        input.files = JSON.stringify(input.files);

        if(existing)
        {
            return this.db.models.Template.update(input).then(() => res.status(202).json(input))
                .catch(e => res.status(400).json({ message : e.message }));
        }
        else
        {
            res.status(404).json({ message : 'The requested template could not be found.' });
        }
    });
}

TemplateWebApi.prototype.deleteTemplate = function(req, res)
{
    const templateId = req.params.templateId;
}
