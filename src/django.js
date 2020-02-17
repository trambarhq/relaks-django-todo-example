const loginURL = '/rest-auth/login/';
const logoutURL = '/rest-auth/logout/';

class Django {
  constructor(dataSource) {
    this.dataSource = dataSource;
  }

  async fetchList(url, options) {
    return this.dataSource.fetchList(url, options);
  }

  async saveOne(url, object) {
    if (object.id) {
      return this.dataSource.updateOne(url, object);
    } else {
      return this.dataSource.insertOne(url, object);
    }
  }

  async deleteOne(url, object) {
    return this.dataSource.deleteOne(url, object);
  }

  async logIn(credentials) {
    return this.dataSource.authenticate(loginURL, credentials);
  }

  async logOut() {
    return this.dataSource.revokeAuthorization(logoutURL);
  }

  loggedIn() {
    return this.dataSource.isAuthorized();
  }

  async authorize(token) {
    return this.dataSource.authorize(token);
  }
}

export {
  Django,
};
