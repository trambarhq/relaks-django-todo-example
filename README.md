Relaks Django Todo Example
--------------------------

This example demonstrates how to build an app that modifies a remote database using [Relaks](https://github.com/chung-leong/relaks) and [Relaks Django Data Source](https://github.com/chung-leong/relaks-django-data-source). It makes use of the Django backend in William S. Vincent's [tutorial on the Django REST framework](https://wsvincent.com/django-rest-framework-authentication-tutorial/). The database consists of a list of todo items. We'll build a simple frontend that lets the user add new items and edit them.

* [Getting started](#getting-started)
* [Tripping an error boundary](#tripping-an-error-boundary)
* [Enabling access control](#enabling-access-control)
* [Bootstrap code](#boostrap-code)
* [Application](#application)
* [Data source proxy](#data-source-proxy)
* [Login form](#login-forum)
* [Logout button](#logout-button)
* [Todo list](#todo-list)
* [Todo view](#todo-view)
* [Update cycle](#update-cycle)
* [Final word](#final-word)

## Getting started

First, set up Django and Django REST, following the detailed instructions at the [Mr. Vincent's post](https://wsvincent.com/django-rest-framework-authentication-tutorial/). Once you have Django up and running, clone this repository then run `npm install`. Once that's done, run `npm run start` to launch [WebPack Dev Server](https://webpack.js.org/configuration/dev-server/). Open a browser window and enter `http://localhost:8080` as the location.

## Tripping an error boundary

The first thing that you'll see is...uh, a big error message. We've run into a CORS violation. Django is listening at port 8000 while our app is at port 8080. The difference in port number means the server must send HTTP headers specifically granting cross-origin access. We can fix that easily. The little hiccup actually is a useful demonstration of Relaks's ability to work with error boundary.

[Error boundary](https://reactjs.org/docs/error-boundaries.html) is a new feature in React 16. When an error occurs in a component's `render()` method, React can now handle it in a structured manner (instead of just blowing up). Relaks extends that to asynchronous errors (a.k.a. promise rejection) encountered in `renderAsync()`. As indicated by the console message, the error was caused by the component `TodoList`, when it tries to fetch a list of todos from Django.

## Enabling CORS

To enable CORS, we need to install the middleware [django-cors-headers](https://pypi.org/project/django-cors-headers/). First shutdown Django then run the following command at the command prompt:

```sh
pipenv install django-cors-headers
```

When that finishes, open `demo_project/settings.py` and add `corsheaders` to `INSTALLED_APPS` and `corsheaders.middleware.CorsMiddleware` to `MIDDLEWARE`:

```python
# demo_project/settings.py

INSTALLED_APPS = [
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',
    'corsheaders',  # new
    'rest_framework',
    'rest_framework.authtoken',
    'rest_auth',
    'api',
    'todos',
]

MIDDLEWARE = [
    'django.middleware.security.SecurityMiddleware',
    'django.contrib.sessions.middleware.SessionMiddleware',
    'corsheaders.middleware.CorsMiddleware',  # new
    'django.middleware.common.CommonMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',
]
```

Then add the variable `CORS_ORIGIN_ALLOW_ALL` and set it to `True`:

```
CORS_ORIGIN_ALLOW_ALL = True  #new
```

Restart the server:

```sh
python manage.py runserver
```

Now when you refresh the example app, it should work properly...sort of. As configured, the server does not require authentication to make changes. That's not what we want.

## Enabling access control

Open `demo_project/settings.py` again and change this:

```python
REST_FRAMEWORK = {
    'DEFAULT_PERMISSION_CLASSES': [
        'rest_framework.permissions.AllowAny'
    ],
}
```

to this:

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

You can make the changes Django is still running. They'll be applied as soon as you save the file. A login screen should now appear in our example app.

Phew! Now that we've got everything up and working, let's take a look at the code.

## Bootstrap code

The bootstrap code ([main.js](https://github.com/chung-leong/relaks-django-todo-example/blob/master/src/main.js)) for this example is fairly simple:

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

Basically, we create the data source (the Django adapter) and hands it to `Application`. The refresh interval is set to a rather extreme 5 seconds. This is so that we would quickly see changes made through the Django admin tool. You can try it by logging into the admin tool at `http://127.0.0.1:8000/admin/` and manually adding a todo item. It should appear in our app after a few seconds. You can also try running multiple instances of the example app in different browser windows.

In an real-world app, something like 5 minutes would be more appropriate.

## Application

`Application` ([application.jsx](https://github.com/chung-leong/relaks-django-todo-example/blob/master/src/application.jsx)) is our root React component. Its `render()` method will print a login form when authentication is required and the list of todos otherwise:

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

Note how each UI component receives `django` as a prop.

We're placing boundary around our UI components so that any error encountered during rendering would appear on the page. That's what we saw earlier.

In `componentDidMount()` we attach event listeners to the data source:

```javascript
componentDidMount() {
    let { dataSource } = this.props;
    dataSource.addEventListener('change', this.handleDataSourceChange);
    dataSource.addEventListener('authentication', this.handleDataSourceAuthentication);
    dataSource.addEventListener('authorization', this.handleDataSourceAuthorization);
    dataSource.addEventListener('deauthorization', this.handleDataSourceDeauthorization);
}
```

When a `change` event occurs, we recreate the data source's [proxy object](https://github.com/chung-leong/relaks#proxy-objects) to force rerendering:

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

`TodoList` ([todo-list.jsx](https://github.com/chung-leong/relaks-django-todo-example/blob/master/src/todo-list.jsx)) is a Relaks `AsyncComponent`. Its job is to fetch data from the remote database and pass it to its synchronous half. Doing so involves just a single asynchronous method call:

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

The options given to `fetchList()` are [hooks](https://github.com/chung-leong/relaks-django-data-source#hooks) that update cached results after a write operation. When an object is inserted into a table, by default the data source would choose to rerun a query because it does not know whether the new object meets the query's criteria. Here, we're fetching all objects in the order they were created. We know a newly created object has to show up at the end of the list. We can therefore save a trip to the server by telling the data source to simply push the object into the array. An update to an object can likewise be handled by replacing the old one.

The call to `more()` would trigger retrieval of additional pages when pagination is used. It doesn't do anything at this time.

The `render()` method of `TodoListSync` takes the list of todos given to it and renders a `TodoView` component for each:

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

An extra item is rendered at the end for adding new todo. Its `todo` prop will be `undefined`.

## Todo view

`TodoView` ([todo-view.jsx](https://github.com/chung-leong/relaks-django-todo-example/blob/master/src/todo-view.jsx)) is a regular React component. It has three different appearances: (1) when it permits editing; (2) when it's showing a todo; (3) when it's just a button for adding a new todo.

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

In edit mode, a text input and a text area, along with a couple buttons, are rendered:

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

When he clicks the save button, we call `django.saveOne()` to save the item. Depending on whether `id` is defined, either an insert or an update operation will be performed. When that finishes, we exit edit mode.

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

In read-only mode, the only the title of the todo is shown initially. The description is rendered into a div that's clipped off (using CSS), along with a couple buttons. These are shown when the user expands the item by clicking on the title.

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

When the user clicks the edit button, we enter edit mode, populating the state with the properties of the todo in question:

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

## Update cycle

Let us examine step-by-step the creation process of a todo so you have clearer understanding of what actually happens.

1. `handleSaveClick()` calls `saveOne()` with the new todo.
2. The object is sent to the server using the HTTP POST method.
3. The server responds with a copy of the object, which now has a database id.
4. The data source runs the `afterInsert` hooks of all impacted queries.
5. The `push` handler places the new object at the end our `fetchList()` query's cached results.
6. The data source emits a `change` event.
7. `handleDataSourceChange()` creates a new `Django` object and calls `setState()`.
8. `Application` rerenders.
9. `renderAsync()` of `TodoList` is called, which in turns calls `fetchList()`.
10. `fetchList()` immediately returns the modified cached results.
11. `TodoListAsync` rerenders the list of todos, with the new one added.

If we hadn't specified `push` as the `afterInsert` hook, the sequence of event would be different starting at step 5:

5. The default `refresh` handler marks the `fetchList()` query as out-of-date.
6. The data source emits a `change` event.
7. `handleDataSourceChange()` creates a new `Django` object and calls `setState()`.
8. `Application` rerenders.
9. `renderAsync()` of `TodoList` is called, which in turns calls `fetchList()`.
10. `fetchList()` immediately returns the old cached results and initiates a rerunning of the query.
11. `TodoListAsync` rerenders the old list of todos.
12. The data source receives the query's results after some time.
13. It notices that the list is different and emits a `change` event.
14. `handleDataSourceChange()` creates a new `Django` object again and calls `setState()`.
15. `Application` rerenders.
16. `fetchList()` immediately returns the new results.
17. `TodoListAsync` rerenders the list of todos, with the new one added.

The default behavior still yields the correct end result, but will seem less smooth as the new object would not appear until the full list is fetched once again.

## Final words

That's it! I hope you were able to follow the example without difficulty.
