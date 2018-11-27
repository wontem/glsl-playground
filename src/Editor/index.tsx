import * as React from 'react';
import { Provider } from 'react-redux';
import { render } from 'react-dom';
import { createGlobalStyle } from 'styled-components';

import { store } from './store';
import { App } from './components/App';

const root = document.body.appendChild(document.createElement('div'));
root.id = 'root';

render(
  (
    <Provider store={store}>
      <App />
    </Provider>
  ),
  root,
);
