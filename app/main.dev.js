/* eslint global-require: 0, flowtype-errors/show-errors: 0 */

/**
 * This module executes inside of electron's main process. You can start
 * electron renderer process from here and communicate with the other processes
 * through IPC.
 *
 * When running `npm run build` or `npm run build-main`, this file is compiled to
 * `./app/main.prod.js` using webpack. This gives us some performance wins.
 *
 * @flow
 */
import { app, BrowserWindow, dialog, ipcMain, Menu, shell } from 'electron';
import serialport from 'serialport';
import path from 'path';

import MenuBuilder from './menu';
import FirmataService from './FirmataService';
import firmataDefaultConfig from './config/firmata/default.json';

const firmataService = new FirmataService(serialport);
const firmataConfigPath = path.join(__dirname, 'config', 'firmata');
const firmataDefaultConfigName = 'default.json';
firmataService.firmataConfig[firmataDefaultConfigName] = firmataDefaultConfig;

const boardWindowService = new (require('./BoardWindowService'))(firmataService);
const scrattinoServer = new (require('./ScrattinoServer'))(firmataService).createServer();

let mainWindow = null;

if (process.env.NODE_ENV === 'production') {
  const sourceMapSupport = require('source-map-support');
  sourceMapSupport.install();
}

if (process.env.NODE_ENV === 'development' || process.env.DEBUG_PROD === 'true') {
  require('electron-debug')();
  const p = path.join(__dirname, '..', 'app', 'node_modules');
  require('module').globalPaths.push(p);
}

const installExtensions = async () => {
  const installer = require('electron-devtools-installer');
  const forceDownload = !!process.env.UPGRADE_EXTENSIONS;
  const extensions = [
    'REACT_DEVELOPER_TOOLS',
    'REDUX_DEVTOOLS'
  ];

  return Promise
    .all(extensions.map(name => installer.default(installer[name], forceDownload)))
    .catch(console.log);
};


const shouldQuit = app.makeSingleInstance(() => {
  // Someone tried to run a second instance, we should focus our window.
  if (mainWindow) {
    if (mainWindow.isMinimized()) mainWindow.restore();
    mainWindow.focus();
  }
});

if (shouldQuit) {
  app.quit();
}


function createMainWindow() {
  // Create the browser window.
  mainWindow = new BrowserWindow({ width: 640, height: 770 });

  // and load the index.html of the app.
  mainWindow.loadURL(path.join(`file://${__dirname}`, 'app.html'));

  mainWindow.on('close', (event) => {
    const options = {
      type: 'question',
      title: 'Confirm',
      buttons: ['Yes', 'No'],
      message: 'Are you sure you want to quit?'
    };
    const choice = dialog.showMessageBox(mainWindow, options);
    if (choice === 0) {
      // 'Yes'
      // Do not prevent the process.
    } else {
      // 'No'
      event.preventDefault();
    }
  });

  // Emitted when the window is closed.
  mainWindow.on('closed', () => {
    // Dereference the window object, usually you would store windows
    // in an array if your app supports multi windows, this is the time
    // when you should delete the corresponding element.
    mainWindow = null;
  });

  firmataService.on('portListChanged', (ports) => {
    if (mainWindow) {
      mainWindow.webContents.send('portListChanged', ports);
    }
  });
}

/**
 * Menu
 */

const template = [{
  label: 'Edit',
  submenu: [{
    label: 'Undo',
    accelerator: 'CmdOrCtrl+Z',
    role: 'undo'
  }, {
    label: 'Redo',
    accelerator: 'Shift+CmdOrCtrl+Z',
    role: 'redo'
  }, {
    type: 'separator'
  }, {
    label: 'Cut',
    accelerator: 'CmdOrCtrl+X',
    role: 'cut'
  }, {
    label: 'Copy',
    accelerator: 'CmdOrCtrl+C',
    role: 'copy'
  }, {
    label: 'Paste',
    accelerator: 'CmdOrCtrl+V',
    role: 'paste'
  }, {
    label: 'Select All',
    accelerator: 'CmdOrCtrl+A',
    role: 'selectall'
  }]
}, {
  label: 'View',
  submenu: [{
    label: 'Toggle Full Screen',
    accelerator: (function () {
      if (process.platform === 'darwin') {
        return 'Ctrl+Command+F';
      }
      return 'F11';
    }()),
    click(item, focusedWindow) {
      if (focusedWindow) {
        focusedWindow.setFullScreen(!focusedWindow.isFullScreen());
      }
    }
  }]
}, {
  label: 'Window',
  role: 'window',
  submenu: [{
    label: 'Minimize',
    accelerator: 'CmdOrCtrl+M',
    role: 'minimize'
  }, {
    label: 'Close',
    accelerator: 'CmdOrCtrl+W',
    role: 'close'
  }, {
    type: 'separator'
  }, {
    // label: 'Reopen Window',
    // accelerator: 'CmdOrCtrl+Shift+T',
    // enabled: false,
    // key: 'reopenMenuItem',
    // click: function () {
    //   app.emit('activate')
    // }
  }]
}, {
  label: 'Help',
  role: 'help',
  submenu: [{
    label: 'Learn More',
    click() {
      shell.openExternal('http://lab.yengawa.com/project/scrattino2/');
    }
  }]
}];


function addUpdateMenuItems(items, position) {
  // if (process.mas) {
  //   // Mac App Store build
  //   return;
  // }
  //
  // const version = app.getVersion();
  // let updateItems = [{
  //   label: `Version ${version}`,
  //   enabled: false
  // }, {
  //   label: 'Checking for Update',
  //   enabled: false,
  //   key: 'checkingForUpdate'
  // }, {
  //   label: 'Check for Update',
  //   visible: false,
  //   key: 'checkForUpdate',
  //   click: function () {
  //     require('electron').autoUpdater.checkForUpdates()
  //   }
  // }, {
  //   label: 'Restart and Install Update',
  //   enabled: true,
  //   visible: false,
  //   key: 'restartToUpdate',
  //   click: function () {
  //     require('electron').autoUpdater.quitAndInstall()
  //   }
  // }];
  //
  // items.splice.apply(items, [position, 0].concat(updateItems))
}

function findReopenMenuItem() {
  const menu = Menu.getApplicationMenu();
  if (!menu) return;

  let reopenMenuItem;
  menu.items.forEach((item) => {
    if (item.submenu) {
      item.submenu.items.forEach((item) => {
        if (item.key === 'reopenMenuItem') {
          reopenMenuItem = item;
        }
      });
    }
  });
  return reopenMenuItem;
}

if (process.platform === 'darwin') {
  const name = app.getName();
  template.unshift({
    label: name,
    submenu: [{
      label: `About ${name}`,
      role: 'about'
    }, {
      type: 'separator'
    }, {
      label: 'Services',
      role: 'services',
      submenu: []
    }, {
      type: 'separator'
    }, {
      label: `Hide ${name}`,
      accelerator: 'Command+H',
      role: 'hide'
    }, {
      label: 'Hide Others',
      accelerator: 'Command+Alt+H',
      role: 'hideothers'
    }, {
      label: 'Show All',
      role: 'unhide'
    }, {
      type: 'separator'
    }, {
      label: 'Quit',
      accelerator: 'Command+Q',
      click() {
        app.quit();
      }
    }]
  });

  // Window menu.
  template[3].submenu.push({
    type: 'separator'
  }, {
      label: 'Bring All to Front',
      role: 'front'
    });

  addUpdateMenuItems(template[0].submenu, 1);
}

if (process.platform === 'win32') {
  const helpMenu = template[template.length - 1].submenu;
  addUpdateMenuItems(helpMenu, 0);
}

/**
 * Add event listeners...
 */

app.on('window-all-closed', () => {
  app.quit();
});


app.on('ready', async () => {
  // if (process.env.NODE_ENV === 'development' || process.env.DEBUG_PROD === 'true') {
  //   await installExtensions();
  // }
  await installExtensions();
  createMainWindow();

  // const menu = Menu.buildFromTemplate(template);
  // Menu.setApplicationMenu(menu);

  const menuBuilder = new MenuBuilder(mainWindow);
  menuBuilder.buildMenu();

  scrattinoServer.start();

  // @TODO: Use 'ready-to-show' event
  //        https://github.com/electron/electron/blob/master/docs/api/browser-window.md#using-ready-to-show-event
  mainWindow.webContents.on('did-finish-load', () => {
    if (!mainWindow) {
      throw new Error('"mainWindow" is not defined');
    }
    mainWindow.show();
    mainWindow.focus();
  });

  // Development settings
  if (process.env.NODE_ENV === 'development' || process.env.DEBUG_PROD === 'true') {
    mainWindow.openDevTools();
    mainWindow.webContents.on('context-menu', (e, props) => {
      const { x, y } = props;

      Menu.buildFromTemplate([{
        label: 'Inspect element',
        click() {
          mainWindow.inspectElement(x, y);
        }
      }]).popup(mainWindow);
    });
  }
});


app.on('activate', () => {
  // On OS X it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (mainWindow === null) {
    createMainWindow();
  }
});

app.on('before-quit', (event) => {
  if (firmataService) {
    firmataService.release();
  }
});

app.on('will-quit', (event) => {
  if (process.platform === 'darwin') {
    // to prevent remain icon in dock on MacOS
    app.dock.hide();
  }
});


/**
 * IPC
 */

// Update porList from renderer to refresh
ipcMain.on('detectPorts', (event, arg) => {
  firmataService.detectPorts();
});

ipcMain.on('updatePortList', () => {
  firmataService.portListChanged();
});

// open and focus window for a board
ipcMain.on('showBoardWindow', (event, portPath) => {
  const board = firmataService.getBoard(portPath);
  if (!board) {
    console.error(`No board to show window on: ${portPath}`);
    return;
  }
  boardWindowService.showBoardWindow(board);
});

ipcMain.on('connectPort', (event, portPath) => {
  firmataService.availablePorts((list) => {
    if (!list.find((portMetaData) => portMetaData.comName === portPath)) {
      firmataService.detectPorts();
    }
  });
  const board = firmataService.getBoard(portPath);
  if (!board) {
    console.error(`No board to connect on: ${portPath}`);
    return;
  }
  if (!board.transport.isOpen) {
    board.transport.open();
    board.transport.once('open', () => {
      setTimeout(() => {
        if (!board.transport.isOpen) return;
        const defaultConfig = firmataService.firmataConfig[firmataDefaultConfigName];
        if (defaultConfig) {
          firmataService.applyBoardConfig(defaultConfig, board);
        }
      }, 6000);
    });
  }
});

ipcMain.on('disconnectPort', (event, portPath) => {
  const board = firmataService.getBoard(portPath);
  if (!board) {
    console.error(`No board to connect on: ${portPath}`);
    return;
  }
  if (board.transport.isOpen) {
    board.transport.close();
  }
});

ipcMain.on('setPinMode', (event, portPath, pinIndex, pinMode) => {
  let board = firmataService.getBoard(portPath);
  if (!board) {
    console.error(`No board to set pinMode on: ${portPath}`);
    board = firmataService.boardList[0];
  }
  board.pinMode(pinIndex, parseInt(pinMode, 10));
});

ipcMain.on('saveBoardConfig', (event, portPath) => {
  const board = firmataService.getBoard(portPath);
  if (!board) {
    console.error(`No board to update on: ${portPath}`);
    return;
  }
  const options = {
    type: 'question',
    title: 'Confirm',
    buttons: ['Yes', 'No'],
    message: 'Are you sure you want to save this configuration?'
  };
  const choice = dialog.showMessageBox(mainWindow, options);
  if (choice === 0) {
    // 'Yes'
    firmataService.saveConfig(
      firmataService.getBoardConfig(board),
      path.join(firmataConfigPath, firmataDefaultConfigName)
    );
  } else {
    // 'No'
  }
});
