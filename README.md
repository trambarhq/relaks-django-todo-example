Relaks Django TODO Example
--------------------------

This example demonstrates how to build an app that modifies a remote database using [Relaks](https://github.com/chung-leong/relaks) and [Relaks Django Data Source](https://github.com/chung-leong/relaks-django-data-source). It makes use of the Django backend in William S. Vincent's [tutorial on the Django REST framework](https://wsvincent.com/django-rest-framework-authentication-tutorial/). The database consists of a list of TODO items. We'll build a simple frontend that lets the user add new items and edit them.

* [Getting started](#getting-started)
* [Bootstrap code](#boostrap-code)
* [Application](#application)
* [Data source proxy](#data-source-proxy)
* [Login form](#login-forum)
* [Logout button](#logout-button)
* [Todo list](#todo-list)
* [Todo view](#todo-view)
* [Enabling access control](#enabling-access-control)

## Getting started

First, set up Django and Django REST, following the detailed instructions at the [Mr. Vincent's post](https://wsvincent.com/django-rest-framework-authentication-tutorial/). Once you have Django up and running, clone this repository then run `npm install`. Once that's done, run `npm run start` to launch [WebPack Dev Server](https://webpack.js.org/configuration/dev-server/). Open a browser window and enter `http://localhost:8080` as the location.

## Bootstrap code

The [bootstrap code](https://github.com/chung-leong/relaks#bootstrapping) for this example is fairly simple:

```javascript
function initialize(evt) {
    // create data source
    let dataSource = new DjangoDataSource({
        baseURL: 'http://127.0.0.1:8000/api/v1',
        refreshInterval: 5000,
    });
    dataSource.activate();

    let appContainer = document.getElementById('app-container');
    if (!appContainer) {
        throw new Error('Unable to find app element in DOM');
    }
    let appElement = createElement(Application, { dataSource });
    render(appElement, appContainer);
}
```

Basically, we create the data source (the Django adapter) and hands it to `Application`. The refresh interval interval is set to a rather extreme 5 seconds, so that we would quickly see changes made through Django admin tool. A real-world app would not query the server that frequently.

## Application

`Application` ([application.jsx](https://github.com/chung-leong/relaks-django-todo-example/blob/master/src/application.jsx)) is our root React component. Its `render()` method will print a login form when authentication is required and the list of TODO's otherwise:

```javascript
render() {
    let { django, authenticating } = this.state;
    if (authenticating) {
        return (
            <div>
                <ErrorBoundary>
                    <h1>Log in</h1>
                    <LoginForm django={django} />
                </ErrorBoundary>
            </div>
        );
    } else {
        return (
            <div>
                <ErrorBoundary>
                    <LogoutButton django={django} />
                    <h1>To-Do list</h1>
                    <TodoList django={django} />
                </ErrorBoundary>
            </div>
        );
    }
}
```

[Error boundary](https://reactjs.org/docs/error-boundaries.html) is a new feature in React 16. It makes it a lot easier to track errors during development. We're placing boundary around our UI components so that any error encountered during rendering would appear on the page.

In `componentDidMount()` we attach event listeners to the data source that was sent as a prop:

```javascript
componentDidMount() {
    let { dataSource } = this.props;
    dataSource.addEventListener('change', this.handleDataSourceChange);
    dataSource.addEventListener('authentication', this.handleDataSourceAuthentication);
    dataSource.addEventListener('authorization', this.handleDataSourceAuthorization);
    dataSource.addEventListener('deauthorization', this.handleDataSourceDeauthorization);
}
```

When a `change` event occurs, we recreate the data source's [proxy object](https://github.com/chung-leong/relaks#proxy-objects) to force rendering:

```javascript
handleDataSourceChange = (evt) => {
    this.setState({ django: new Django(evt.target) });
}
```

The data source emits an `authentication` event when the remote server responds to a request with the [HTTP status code 401](https://httpstatuses.com/401). We handle the event by providing an authorization token that has been saved earlier into `sessionStorage`. If there isn't one or the token has expired, we change `authenticating` in `Application`'s state to `true`. The app will then rerender, showing the login form.

```javascript
handleDataSourceAuthentication = async (evt) => {
    let { django } = this.state;
    let token = sessionStorage.token;
    let success = await django.authorize(token);
    if (!success) {
        delete sessionStorage.token;
        this.setState({ authenticating: true });
    }
}
```

The data source emits an `authorization` event when it receives an authorization token. `evt.fresh` indicates whether the token is freshly issued by the server (as opposed to being given by the code above). If it is, then we save the token to `sessionStorage` and stop showing the login form.

```javascript
handleDataSourceAuthorization = (evt) => {
    if (evt.fresh) {
        sessionStorage.token = evt.token;
        this.setState({ authenticating: false });
    }
}
```

The `deauthorization` event occurs when the user logs out. That's time to get rid of the saved token.

```javascript
handleDataSourceDeauthorization = (evt) => {
    delete sessionStorage.token;
}
```

## Data source proxy

`Django` ([django.js](https://github.com/chung-leong/relaks-django-todo-example/blob/master/src/application.jsx)) is a wrapper class. It does little aside from calling corresponding methods in the data source:

```javascript
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
```

## Login form

The `render()` method of LoginForm ([login-form.jsx](https://github.com/chung-leong/relaks-django-todo-example/blob/master/src/login-form.jsx)) just renders a couple text fields and a button:

```javascript
render() {
    let { username, password } = this.state;
    let disabled = !username.trim() || !password.trim();
    return (
        <div className="login-form">
            {this.renderError()}
            <form onSubmit={this.handleFormSubmit}>
                <div className="label">Username or E-mail:</div>
                <div className="field">
                    <input type="text" value={username} onChange={this.handleUsernameChange} />
                </div>
                <div className="label">Password:</div>
                <div className="field">
                    <input type="password" value={password} onChange={this.handlePasswordChange} />
                </div>
                <div className="buttons">
                    <button type="submit" disabled={disabled}>
                        Log in
                    </button>
                </div>
            </form>
        </div>
    );
}
```

The event handlers given to the input fields save text into the form's state:

```javascript
handleUsernameChange = (evt) => {
    this.setState({ username: evt.target.value });
}

handlePasswordChange = (evt) => {
    this.setState({ password: evt.target.value });
}
```

When the user clicks the button, the form element fires a `submit` event. We try to log into the system by calling calling `django.logIn()` with the user-provided credentials. If it works, then `Application` will rerender and `LoginForm` will be unmounted. We're done here. If it doesn't we'll save the error object to the form's state so it can be shown to the user.

```javascript
handleFormSubmit = async (evt) => {
    try {
        evt.preventDefault();

        let { django } = this.props;
        let { username, password } = this.state;
        let credentials = { username, password };
        if (username.indexOf('@') !== -1) {
            credentials = { email: username, password };
        }
        await django.logIn(credentials);
    } catch (err) {
        this.setState({ error: err });
    }
}
```

## Logout button

`LogoutButton` ([logout-button.jsx](https://github.com/chung-leong/relaks-django-todo-example/blob/master/src/logout-button.jsx)) is extremely simple. It renders a button when the user is logged in and nothing when he's not:

```javascript
render() {
    let { django } = this.props;
    if (!django.loggedIn()) {
        return null;
    }
    return (
        <button className="logout" onClick={this.handleClick}>
            Log out
        </button>
    );
}
```

When the user clicks the button, we call `django.logOut()` to log him out of the system.

```javascript
handleClick = async (evt) => {
    let { django } = this.props;
    await django.logOut();
}
```

## Todo list

`TodoList` ([todo-list.jsx](https://github.com/chung-leong/relaks-django-todo-example/blob/master/src/todo-list.jsx)) is a Relaks `AsyncComponent`. Its job is to fetch the necessary data from the remote database and pass it to its synchronous half. Doing so involves just a single asynchronous method call:

```javascript
async renderAsync(meanwhile) {
    let { django } = this.props;
    let props = {
        django
    };
    meanwhile.show(<TodoListSync {...props} />);
    let options = {
        afterInsert: 'push',
        afterUpdate: 'replace',
        afterDelete: 'remove',
    };
    props.todos = await django.fetchList('/', options);
    props.todos.more();
    return <TodoListSync {...props} />;
}
```

The options given to `fetchList()` are [hooks](https://github.com/chung-leong/relaks-django-data-source#hooks) that control how cached results are updated after a write operation. When an object is inserted into a table, by default the data source would choose to rerun a query because it does not know whether the new object meets the query's criteria. Here, we're fetching all objects in the order they were created. We know a newly created object has to show up at the end of the list. We can therefore save a trip to the server by telling the data source to simply push the object into the array. An update to an object can likewise be handled by replacing the old one.

The call to `more()` would trigger retrieval of additional pages when pagination is used. It doesn't do anything at this time.

The `render()` method of `TodoListSync` takes the list of TODO's given to it and renders a `TodoView` component for each:

```javascript
render() {
    let { todos, django } = this.props;
    if (!todos) {
        return <div>Loading...</div>;
    }
    return (
        <ul className="todo-list">
        {
            todos.map((todo) => {
                let viewProps = {
                    todo,
                    django,
                };
                return <TodoView key={todo.id} {...viewProps} />;
            })
        }
        <TodoView key={0} django={django} />
        </ul>
    );
}
```

An extra item is rendered at the end for adding new TODO. Its `todo` prop will be `undefined`.

## Todo view

`TodoView` ([todo-view.jsx](https://github.com/chung-leong/relaks-django-todo-example/blob/master/src/todo-view.jsx)) is a regular React component. It has three different appearances: (1) when it permits editing; (2) when it's showing a TODO; (3) when it's just a button for adding a new TODO.

```javascript
render() {
    let { todo } = this.props;
    let { editing } = this.state;
    if (editing) {
        return this.renderEditor();
    } else if (todo) {
        return this.renderView();
    } else {
        return this.renderAddButton();
    }
}
```

The last case is the simplest:

```javascript
renderAddButton() {
    return (
        <li className="todo-view add">
            <span className="add-button" onClick={this.handleAddClick}>
                Add new item
            </span>
        </li>
    );
}
```

When the user clicks it, we switch into edit mode:

```javascript
handleAddClick = (evt) => {
    this.setState({ editing: true, id: undefined, title: '', description: '' });
}
```

In edit mode, a text input and a text area, along with a couple buttons are rendered:

```javascript
renderEditor() {
    let { title, description } = this.state;
    let disabled = !title.trim() || !description.trim();
    return (
        <li className="todo-view expanded edit">
            <div className="title">
                <input type="text" value={title} onChange={this.handleTitleChange} />
            </div>
            <div className="extra">
                <div className="description">
                    <textarea value={description} onChange={this.handleDescriptionChange} />
                </div>
                <div className="buttons">
                    <button onClick={this.handleSaveClick} disabled={disabled}>Save</button>
                    <button onClick={this.handleCancelClick}>Cancel</button>
                </div>
            </div>
        </li>
    );
}
```

When the user makes changes, these handlers are called:

```javascript
handleTitleChange = (evt) => {
    this.setState({ title: evt.target.value });
}

handleDescriptionChange = (evt) => {
    this.setState({ description: evt.target.value });
}
```

When he clicks the save button, we call `django.saveOne()` to save the item. Depending on whether `id` is defined, either an insert or an update operation is done. When that finishes, we exit edit mode.

```javascript
handleSaveClick = async (evt) => {
    let { django } = this.props;
    let { id, title, description } = this.state;
    let todo = { id, title, description };
    await django.saveOne('/', todo);
    this.setState({ editing: false });
}
```

If he clicks the cancel button, we exit without saving:

```javascript
handleCancelClick = (evt) => {
    this.setState({ editing: false });
}
```

In read-only mode, the only the title of the TODO is shown initially. The description is rendered into a div that's clipped off (using CSS), along with a couple buttons. These are shown when the user expands the item by clicking on the title.

```javascript
renderView() {
    let { todo } = this.props;
    let { expanded } = this.state;
    let { title, description } = todo;
    let className = 'todo-view';
    if (expanded) {
        className += ' expanded';
    }
    return (
        <li className={className}>
            <div className="title">
                <span onClick={this.handleTitleClick}>{title}</span>
            </div>
            <div className="extra">
                <div className="description">{description}</div>
                <div className="buttons">
                    <button onClick={this.handleEditClick}>Edit</button>
                    <button onClick={this.handleDeleteClick}>Delete</button>
                </div>
            </div>
        </li>
    );
}
```

The click handler toggles `expanded` in `this.state`:

```javascript
handleTitleClick = (evt) => {
    let { expanded } = this.state;
    this.setState({ expanded: !expanded });
}
```

When the user clicks the edit button, we enter exit mode, populating the state with the properties of the TODO in question:

```javascript
handleEditClick = (evt) => {
    let { todo } = this.props;
    let { id, title, description } = todo;
    this.setState({ editing: true, id, title, description });
}
```

If he clicks the delete button, we call `django.deleteOne()` to delete that item:

```javascript
handleDeleteClick = async (evt) => {
    let { django, todo } = this.props;
    await django.deleteOne('/', todo);
}
```

## Enabling access control

```python
REST_FRAMEWORK = {
    'DEFAULT_AUTHENTICATION_CLASSES': [
       'rest_framework.authentication.TokenAuthentication',
    ],
    'DEFAULT_PERMISSION_CLASSES': [
        'rest_framework.permissions.AllowAny'
    ],
}

```

```python
REST_FRAMEWORK = {
    'DEFAULT_AUTHENTICATION_CLASSES': [
       'rest_framework.authentication.TokenAuthentication',
    ],
    'DEFAULT_PERMISSION_CLASSES': [
        'rest_framework.permissions.IsAuthenticated',
    ],
}
```
