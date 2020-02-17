import { createElement } from 'react';
import { render } from 'react-dom';
import { DataSource } from 'relaks-django-data-source/src/index.mjs';
import { FrontEnd } from './front-end.jsx';

window.addEventListener('load', initialize);

function initialize(evt) {
  // create data source
  const dataSource = new DataSource({
    baseURL: 'http://127.0.0.1:8000/api/v1',
    refreshInterval: 5000,
  });
  dataSource.activate();

  const container = document.getElementById('react-container');
  const element = createElement(FrontEnd, { dataSource });
  render(element, container);
}
