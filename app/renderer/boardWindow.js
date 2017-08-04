/**
 * Created by ky on 2016/12/01.
 */

import React from 'react';
import ReactDOM from 'react-dom';
import {Provider} from 'react-redux';
import BoardContainer from './containers/BoardContainer';
import configureStore from './store/boardStore';
import {ipcRenderer} from 'electron';

const store = configureStore();

ReactDOM.render(
  <Provider store={store}>
    <BoardContainer />
  </Provider>,
  document.getElementById('root')
);

import {boardChanged} from './actions/BoardActions';

let portPath = null;

ipcRenderer.on('boardChanged', function (event, aBoard) {
  if (aBoard) {
    portPath = aBoard.portPath;
  }
  store.dispatch(boardChanged(aBoard));
});

function updateBoard() {
  let portPath = store.getState().board.portPath;
  if (portPath) {
    ipcRenderer.send('updateBoard', portPath);
  }
}

let boardUpdater = setInterval(() => {
  updateBoard()
}, 100);

import { portListChanged } from './actions/PortListActions';

ipcRenderer.on('portListChanged', function (event, ports) {
  store.dispatch(portListChanged(ports));
});

// Get current portList
ipcRenderer.send('updatePortList');
