import { createElement } from 'react';
import { render } from 'react-dom';
import { FrontEnd } from 'front-end';
import DjangoDataSource from 'relaks-django-data-source';

window.addEventListener('load', initialize);

function initialize(evt) {
    // create data source
    let dataSource = new DjangoDataSource({
        baseURL: 'http://127.0.0.1:8000/api/v1',
        refreshInterval: 5000,
    });
    dataSource.activate();

    let container = document.getElementById('react-container');
    let element = createElement(FrontEnd, { dataSource });
    render(element, container);
}
