/**
 * Created by ky on 2016/11/30.
 */

const electron = require('electron');
const app = electron.app;
const BrowserWindow = electron.BrowserWindow;
const Menu = electron.Menu;
const dialog = electron.dialog;
const ipcMain = electron.ipcMain;
const path = require('path');

const firmataService = new (require('./FirmataService'))(require('serialport'));
const firmataConfigPath = path.join(__dirname, 'config', 'firmata');
const firmataDefaultConfigName = 'default.json';
firmataService.readConfig(firmataConfigPath, firmataDefaultConfigName);

const boardWindowService = new (require('./BoardWindowService'))(firmataService);
const scrattinoServer = new (require('./ScrattinoServer'))(firmataService).createServer();

//// in ES6
// import electron from 'electron';
// import {app, BrowserWindow, Menu, ipcMain} from 'electron';
// import path from 'path';

// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
let mainWindow = null;


if (process.env.NODE_ENV === 'production') {
  const sourceMapSupport = require('source-map-support');
  sourceMapSupport.install();
}

if (process.env.NODE_ENV === 'development' || process.env.DEBUG_PROD === 'true') {
  require('electron-debug')();
  const path = require('path');
  const p = path.join(__dirname, '..', 'app', 'node_modules');
  require('module').globalPaths.push(p);
}

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

const rootPath = `file://${__dirname}`;

function installExtensions() {
  if (process.env.NODE_ENV === 'development') {
    const installer = require('electron-devtools-installer'); // eslint-disable-line global-require

    const extensions = [
      'REACT_DEVELOPER_TOOLS',
      'REDUX_DEVTOOLS'
    ];
    const forceDownload = !!process.env.UPGRADE_EXTENSIONS;
    for (const name of extensions) { // eslint-disable-line
      try {
        installer.default(installer[name], forceDownload);
      } catch (e) {
      } // eslint-disable-line
    }
  }
}

function createMainWindow() {

  // Create the browser window.
  mainWindow = new BrowserWindow({width: 640, height: 770});

  // and load the index.html of the app.
  mainWindow.loadURL(path.join(rootPath, '.', 'renderer', 'mainWindow.html'));

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
  mainWindow.on('closed', function () {
    // Dereference the window object, usually you would store windows
    // in an array if your app supports multi windows, this is the time
    // when you should delete the corresponding element.
    mainWindow = null;
  });

  firmataService.on('portListChanged', function (ports) {
    if (mainWindow) {
      mainWindow.webContents.send('portListChanged', ports);
    }
  });
}

let template = [{
  label: 'View',
  submenu: [{
    label: 'Toggle Full Screen',
    accelerator: (function () {
      if (process.platform === 'darwin') {
        return 'Ctrl+Command+F'
      } else {
        return 'F11'
      }
    })(),
    click: function (item, focusedWindow) {
      if (focusedWindow) {
        focusedWindow.setFullScreen(!focusedWindow.isFullScreen())
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
    click: function () {
      electron.shell.openExternal('http://lab.yengawa.com/project/scrattino2/')
    }
  }]
}];


function addUpdateMenuItems(items, position) {
  // if (process.mas) {
  //   // Mac App Store build
  //   return;
  // }
  //
  // const version = electron.app.getVersion();
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
  menu.items.forEach(function (item) {
    if (item.submenu) {
      item.submenu.items.forEach(function (item) {
        if (item.key === 'reopenMenuItem') {
          reopenMenuItem = item
        }
      })
    }
  });
  return reopenMenuItem
}

if (process.platform === 'darwin') {
  const name = electron.app.getName();
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
      click: function () {
        app.quit()
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

  addUpdateMenuItems(template[0].submenu, 1)
}

if (process.platform === 'win32') {
  const helpMenu = template[template.length - 1].submenu;
  addUpdateMenuItems(helpMenu, 0)
}

app.on('ready', function () {
  installExtensions();
  const menu = Menu.buildFromTemplate(template);
  Menu.setApplicationMenu(menu);
  createMainWindow();
  // firmataService.startPortListing();

  // Development settings
  if (process.env.NODE_ENV === 'development') {
    mainWindow.openDevTools();
    mainWindow.webContents.on('context-menu', (e, props) => {
      const {x, y} = props;

      Menu.buildFromTemplate([{
        label: 'Inspect element',
        click() {
          mainWindow.inspectElement(x, y);
        }
      }]).popup(mainWindow);
    });
  }
  scrattinoServer.start();
});


// app.on('browser-window-created', function () {
//   let reopenMenuItem = findReopenMenuItem();
//   if (reopenMenuItem) reopenMenuItem.enabled = false
// });

// app.on('window-all-closed', function () {
//   let reopenMenuItem = findReopenMenuItem();
//   if (reopenMenuItem) reopenMenuItem.enabled = true
// });

// Quit when all windows are closed.
app.on('window-all-closed', function () {
  app.quit();
});

app.on('activate', function () {
  // On OS X it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (mainWindow === null) {
    createMainWindow();
  }
});

app.on('before-quit', function (event) {
  if (firmataService) {
    firmataService.release();
  }
});

app.on('will-quit', function (event) {
  // to prevent remain icon in dock on MacOS
  app.dock.hide();
});

// Update porList from renderer to refresh
ipcMain.on('detectPorts', (event, arg) => {
  firmataService.detectPorts();
});

ipcMain.on('updatePortList', () => {
  firmataService.portListChanged();
});

// open and focus window for a board
ipcMain.on('showBoardWindow', (event, portPath) => {
  let board = firmataService.getBoard(portPath);
  if (!board) {
    console.error("No board to show window on: " + portPath);
    return;
  }
  boardWindowService.showBoardWindow(board);
});

ipcMain.on('connectPort', (event, portPath) => {
  firmataService.availablePorts((list) => {
    if (!list.find((portMetaData) => {
        return portMetaData.comName === portPath;
      })) {
      firmataService.detectPorts();
      return;
    }
  });
  let board = firmataService.getBoard(portPath);
  if (!board) {
    console.error("No board to connect on: " + portPath);
    return;
  }
  if (!board.transport.isOpen()) {
    board.transport.open();
    board.transport.once('open', () => {
      setTimeout(() => {
        if (!board.transport.isOpen()) return;
        let defaultConfig = firmataService.firmataConfig[firmataDefaultConfigName];
        if (defaultConfig) {
          firmataService.applyBoardConfig(defaultConfig, board);
        }
      }, 6000);
    })
  }
});

ipcMain.on('disconnectPort', (event, portPath) => {
  let board = firmataService.getBoard(portPath);
  if (!board) {
    console.error("No board to connect on: " + portPath);
    return;
  }
  if (board.transport.isOpen()) {
    board.transport.close();
  }
});

ipcMain.on('setPinMode', (event, portPath, pinIndex, pinMode) => {
  let board = firmataService.getBoard(portPath);
  if (!board) {
    console.error("No board to set pinMode on: " + portPath);
    board = firmataService.boardList[0];
  }
  board.pinMode(pinIndex, parseInt(pinMode));
});

ipcMain.on('saveBoardConfig', (event, portPath) => {
  let board = firmataService.getBoard(portPath);
  if (!board) {
    console.error("No board to update on: " + portPath);
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
    firmataService.saveConfig(firmataService.getBoardConfig(board), path.join(firmataConfigPath, firmataDefaultConfigName));
  } else {
    // 'No'
  }
});
