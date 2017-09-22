class ApiBase
{
    getErrorFromResponse(res)
    {
        if(res)
            return new Error((res.body && res.body.message) || res.body);

        return new Error('An unknown error occured.');
    }
}

export default ApiBase;
