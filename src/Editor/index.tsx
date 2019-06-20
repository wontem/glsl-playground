import * as React from 'react';
import { render } from 'react-dom';
import { GLContextProvider } from '../GLContext';
import { App } from './components/App';

const root = document.body.appendChild(document.createElement('div'));
root.id = 'root';

render(
  // <Provider store={store}>
  //   <App />
  // </Provider>,
  <GLContextProvider>
    <App />
  </GLContextProvider>,
  root,
);
