import ajax from 'superagent-bluebird-promise';

class Api
{
    static makePathDirectory(path)
    {
        if(!path.startsWith('/'))
            path = '/' + path;
        if(!path.endsWith('/'))
            path += '/';

        return path;
    }

    static getErrorFromRequest(result)
    {
        throw new Error((result.body && result.body.message) || result.body || result);
    }

    static getLanguages(locale)
    {
        return ajax.get('/isodata/api/languages').set('Accept-Language', locale)
            .then(res => res && res.body).catch(Api.getErrorFromRequest);
    }

    static getCountries(locale)
    {
        return ajax.get('/isodata/api/countries').set('Accept-Language', locale)
            .then(res => res && res.body).catch(Api.getErrorFromRequest)
    }

    static getTemplates(customerId)
    {
        return ajax.get(`/onboarding/api/templates/${customerId}`)
            .then(result => result.body.sort((a, b) => a.name.localeCompare(b.name)))
            .catch(Api.getErrorFromRequest);
    }

    static getTemplate(customerId, templateId)
    {
        return ajax.get(`/onboarding/api/templates/${customerId}/${templateId}`)
            .then(res => res && res.body).catch(Api.getErrorFromRequest);
    }

    static deleteTemplate(customerId, templateId, templateFileDirectory)
    {
        return ajax.delete(`/onboarding/api/templates/${customerId}/${templateId}`)
            .then(() => Api.deleteFilesOfTemplate(customerId, templateId, templateFileDirectory))
            .catch(Api.getErrorFromRequest);
    }

    static addTemplate(customerId, template)
    {
        return ajax.post(`/onboarding/api/templates/${customerId}`)
            .set('Content-Type', 'application/json')
            .send(template)
            .then(res => res && res.body).catch(Api.getErrorFromRequest);
    }

    static updateTemplate(customerId, templateId, template)
    {
        return ajax.put(`/onboarding/api/templates/${customerId}/${templateId}`)
            .set('Content-Type', 'application/json')
            .send(template)
            .then(res => res && res.body).catch(Api.getErrorFromRequest);
    }

    static copyFilesOfTemplate(customerId, fromPath, toPath)
    {
        fromPath = Api.makePathDirectory(fromPath);
        toPath = Api.makePathDirectory(toPath);

        return ajax.put(`/blob/api/c_${customerId}/copy${fromPath}`)
            .set('Content-Type', 'application/json')
            .query({ overwriteExisting : true })
            .send({ dstPath : toPath })
            .catch(Api.getErrorFromRequest);
    }

    static deleteFilesOfTemplate(customerId, templateId, templateFileDirectory)
    {
        let path = templateFileDirectory;

        if(path)
        {
            path = Api.makePathDirectory(path) + templateId + '/';

            return ajax.delete(`/blob/api/c_${customerId}/files${path}`)
                .query({ recursive: true }).catch(Api.getErrorFromRequest);
        }

        return Promise.resolve();
    }

    static getFiles(customerId, path)
    {
        if(!path.startsWith('/'))
            path = '/' + path;
        if(!path.endsWith('/'))
            path += '/';

        return ajax.get(`/blob/api/c_${customerId}/files${path}`)
            .then(result => result.body.sort((a, b) => a.name.localeCompare(b.name)))
            .catch(Api.getErrorFromRequest);
    }
}

export default Api;
