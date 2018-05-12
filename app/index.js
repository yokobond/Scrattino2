import React from 'react';
import { render } from 'react-dom';
import { AppContainer } from 'react-hot-loader';
import { ipcRenderer } from 'electron';

import Root from './containers/Root';
import { configureStore, history } from './store/configureStore';
import './app.global.css';

import { portListChanged, portListSelect } from './actions/PortListActions';
import { boardChanged } from './actions/BoardActions';

const store = configureStore();

render(
  <AppContainer>
    <Root store={store} history={history} />
  </AppContainer>,
  document.getElementById('root')
);

if (module.hot) {
  module.hot.accept('./containers/Root', () => {
    const NextRoot = require('./containers/Root'); // eslint-disable-line global-require
    render(
      <AppContainer>
        <NextRoot store={store} history={history} />
      </AppContainer>,
      document.getElementById('root')
    );
  });
}


ipcRenderer.on('portListChanged', (event, ports) => {
  if (store.getState().portList.selectedPort
    && !ports.find((port) => port.path === store.getState().portList.selectedPort)) {
    store.dispatch(portListSelect(null));
  }
  store.dispatch(portListChanged(ports));
});

ipcRenderer.on('boardChanged', (event, aBoard) => {
  if (aBoard) {
    store.dispatch(boardChanged(aBoard));
  }
});

function updateBoard() {
  const portPath = store.getState().portList.selectedPort;
  if (portPath) {
    ipcRenderer.send('updateBoard', portPath);
  }
}

const boardUpdater = setInterval(
  () => {
    updateBoard();
  },
  100
);

ipcRenderer.send('detectPorts');
