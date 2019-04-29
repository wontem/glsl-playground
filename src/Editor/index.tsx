import * as React from 'react';
import { render } from 'react-dom';
import { Provider } from 'react-redux';
import { store } from './store';

import { App } from './components/App';
// import { ObsGraphView } from '../GraphView/GraphView';

const root = document.body.appendChild(document.createElement('div'));
root.id = 'root';

render(
  <Provider store={store}>
    <App />
  </Provider>,
  // <ObsGraphView />,
  root,
);
