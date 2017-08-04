/**
 * Created by ky on 2016/12/08.
 */

const electron = require('electron');
const BrowserWindow = electron.BrowserWindow;
const ipcMain = electron.ipcMain;
const Menu = electron.Menu;
const path = require('path');

const rootPath = `file://${__dirname}`;

function BoardWindowService(firmataService) {
  this.firmataService = firmataService;
  this.boardWindows = [];

  ipcMain.on('updateBoard', (event, portPath) => {
    let board = this.firmataService.getBoard(portPath);
    let boardData = null;
    if (board) {
      boardData = {};
      boardData.pins = board.pins;
      boardData.MODES = board.MODES;
      boardData.isReady = board.isReady;
      boardData.portPath = board.transport.path;
      boardData.isOpen = board.transport.isOpen();
    }
    event.sender.send('boardChanged', boardData);
  });
}

BoardWindowService.prototype.getBoardWindow = function (portPath) {
  return this.boardWindows.find((bw) => (bw.portPath === portPath));
};

BoardWindowService.prototype.removeBoardWindow = function (portPath) {
  this.boardWindows = this.boardWindows.filter((bw) => (bw.portPath !== portPath));
};

let boardUpdateIntervalTime = 1000;

BoardWindowService.prototype.createBoardWindow = function (board) {
  const portPath = board.transport.path;
  const newWindow = new BrowserWindow({width: 600, height: 400, show: false});
  // newWindow.board = board;
  // newWindow.portPath = portPath;
  // newWindow.updater = setInterval(
  //   function() {
  //     let boardData = {};
  //     boardData.pins = this.board.pins;
  //     boardData.MODES = this.board.MODES;
  //     boardData.isReady = this.board.isReady;
  //     boardData.portPath = this.board.transport.path;
  //     boardData.isOpen = this.board.transport.isOpen();
  //     this.webContents.send('boardChanged', boardData);
  //   }.bind(newWindow),
  //   boardUpdateIntervalTime);
  function errorListener(err) {
    newWindow.webContents.send('error', err);
  }
  board.on('error', errorListener);
  newWindow.on('closed',
    () => {
      clearInterval(newWindow.updater);
      this.removeBoardWindow(portPath);
      // board.removeListener('changed', boardChangeListener);
      board.removeListener('error', errorListener);
    });
  this.firmataService.on('portListChanged', function (ports) {
    newWindow.webContents.send('portListChanged', ports);
  });
  newWindow.loadURL(path.join(rootPath, '..', 'renderer', 'boardWindow.html'));

  // Development settings
  if (process.env.NODE_ENV === 'development') {
    newWindow.openDevTools();
    newWindow.webContents.on('context-menu', (e, props) => {
      const {x, y} = props;

      Menu.buildFromTemplate([{
        label: 'Inspect element',
        click() {
          newWindow.inspectElement(x, y);
        }
      }]).popup(newWindow);
    });
  }

  return newWindow;
};

let isSingletonWindow = true;

BoardWindowService.prototype.showBoardWindow = function (board) {
  let window = this.getBoardWindow(board.transport.path);
  if (isSingletonWindow && window) {
    if (window.isMinimized()) window.restore();
  } else {
    window = this.createBoardWindow(board);
    this.boardWindows.push(window);
  }
  window.show();
};

module.exports = BoardWindowService;