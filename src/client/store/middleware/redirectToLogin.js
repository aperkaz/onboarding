const redirectIfUnauthorized = store => next => action => {
    if (action.statusCode) {
        return window.location.replace('/onboarding')
    }
    let result = next(action);
    return result;
}

const ifValidBodyAndType = (response) => {
    if (!response.body || (response.type != 'application/json')) {
        let error = new Error("Unauthorized");
        error.code = 401;
        throw error;
    }
    return response;
}

export { ifValidBodyAndType };
export default redirectIfUnauthorized;