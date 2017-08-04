/**
 * Created by ky on 2016/12/01.
 */

import React from 'react';
import ReactDOM from 'react-dom';
import {Provider} from 'react-redux';
import PortListContainer from './containers/PortListContainer';
import BoardMonitorContainer from './containers/BoardMonitorContainer';
import configureStore from './store/mainStore';
import {ipcRenderer} from 'electron';

const store = configureStore();

ReactDOM.render(
  <Provider store={store}>
    <div>
      <PortListContainer/>
      <BoardMonitorContainer/>
    </div>
  </Provider>,
  document.getElementById('root')
);

import {portListChanged, portListSelect} from './actions/PortListActions';

ipcRenderer.on('portListChanged', function (event, ports) {
  if (store.getState().portList.selectedPort
    && !ports.find((port) => {
      return port.path === store.getState().portList.selectedPort;
    })) {
    store.dispatch(portListSelect(null));
  }
  store.dispatch(portListChanged(ports));
});

import {boardChanged} from './actions/BoardActions';

ipcRenderer.on('boardChanged', function (event, aBoard) {
  if (aBoard) {
    store.dispatch(boardChanged(aBoard));
  }
});

function updateBoard() {
  let portPath = store.getState().portList.selectedPort;
  if (portPath) {
    ipcRenderer.send('updateBoard', portPath);
  }
}

let boardUpdater = setInterval(() => {
    updateBoard();
  },
  100);

ipcRenderer.send('detectPorts');

