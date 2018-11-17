const loginURL = '/rest-auth/login/';
const logoutURL = '/rest-auth/logout/';

class Django {
    constructor(dataSource) {
        this.dataSource = dataSource;
    }

    fetchList(url, options) {
        return this.dataSource.fetchList(url, options);
    }

    saveOne(url, object) {
        if (object.id) {
            return this.dataSource.updateOne(url, object);
        } else {
            return this.dataSource.insertOne(url, object);
        }
    }

    deleteOne(url, object) {
        return this.dataSource.deleteOne(url, object);
    }

    authenticate(credentials) {
        return this.dataSource.authenticate(loginURL, credentials);
    }

    authorize(token) {
        return this.dataSource.authorize(token);
    }

    cancelAuthentication() {
        return this.dataSource.cancelAuthentication();
    }

    revokeAuthorization() {
        return this.dataSource.revokeAuthorization(logoutURL);
    }
}

export {
    Django as default,
    Django,
};
