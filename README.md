Relaks Django Todo Example
--------------------------

* [Getting started](#getting-started)
* [Bootstrap code](#boostrap-code)
* [Application](#application)
* [Data source proxy](#data-source-proxy)
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
        refreshInterval: 10000,
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

Basically, we create the data source (the Django adapter) and hands it to `Application`.

## Application


## Data source proxy


## Todo list


## Todo view


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
