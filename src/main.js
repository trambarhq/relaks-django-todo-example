import { h, render } from 'preact';
import { Application } from 'application';
import DjangoDataSource from 'relaks-django-data-source';

async function initialize(evt) {
    // create data source
    let dataSource = new DjangoDataSource({
        baseURL: 'http://127.0.0.1:8000/api/v1',
        refreshInterval: 15000,
    });
    await dataSource.initialize();

    let appContainer = document.getElementById('app-container');
    if (!appContainer) {
        throw new Error('Unable to find app element in DOM');
    }
    let appElement = h(Application, { dataSource });
    render(appElement, appContainer);
}

window.addEventListener('load', initialize);
