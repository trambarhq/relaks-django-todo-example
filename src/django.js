class Django {
    /**
     * Remember the data source
     */
    constructor(dataSource) {
        this.dataSource = dataSource;
    }

    /**
     * Fetch a list of objects from data source
     *
     * @param  {String} url
     * @param  {Object} options
     *
     * @return {Promise<Array>}
     */
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

    authenticate(loginURL, credentials, allowURLs) {
        return this.dataSource.authenticate(loginURL, credentials, allowURLs);
    }

    authorize(loginURL, token, allowURLs) {
        return this.dataSource.authorize(loginURL, token, allowURLs);
    }

    cancelAuthentication(allowURLs) {
        return this.dataSource.cancelAuthentication(allowURLs);
    }
}

export {
    Django as default,
};
