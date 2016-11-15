/**
 * Created by ky on 2016/05/16.
 */
"use strict";

// const electron = require('electron')
// Module to control application life.
// const app = electron.app
// Module to create native browser window.
// const BrowserWindow = electron.BrowserWindow

// for electron 0.30.6
const app = require('app');
const BrowserWindow = require('browser-window');

// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
let mainWindow;

function createWindow() {
    // Create the browser window.
    mainWindow = new BrowserWindow({width: 800, height: 600});

    // and load the index.html of the app.
    mainWindow.loadUrl('file://' + __dirname + '/index.html');

    installMenu();

    // Open the DevTools.
    // mainWindow.webContents.openDevTools();

    // Emitted when the window is closed.
    mainWindow.on('closed', function () {
        // Dereference the window object, usually you would store windows
        // in an array if your app supports multi windows, this is the time
        // when you should delete the corresponding element.
        mainWindow = null;
    })
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', createWindow);

// Quit when all windows are closed.
app.on('window-all-closed', function () {
    // On OS X it is common for applications and their menu bar
    // to stay active until the user quits explicitly with Cmd + Q
    if (process.platform !== 'darwin') {
        app.quit();
    }
});

app.on('activate', function () {
    // On OS X it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (mainWindow === null) {
        createWindow();
    }
});

function installMenu() {
    var Menu = require('menu');
    var menu;
    if (process.platform == 'darwin') {
        menu = Menu.buildFromTemplate([
            {
                label: 'Scrattino2',
                submenu: [
                    {
                        label: 'About Scrattino2',
                        selector: 'orderFrontStandardAboutPanel:'
                    },
                    {
                        type: 'separator'
                    },
                    {
                        label: 'Services',
                        submenu: []
                    },
                    {
                        type: 'separator'
                    },
                    {
                        label: 'Hide Scrattino2',
                        accelerator: 'Command+H',
                        selector: 'hide:'
                    },
                    {
                        label: 'Hide Others',
                        accelerator: 'Command+Shift+H',
                        selector: 'hideOtherApplications:'
                    },
                    {
                        label: 'Show All',
                        selector: 'unhideAllApplications:'
                    },
                    {
                        type: 'separator'
                    },
                    {
                        label: 'Quit',
                        accelerator: 'Command+Q',
                        click: function () {
                            app.quit();
                        }
                    }
                ]
            },
            {
                label: 'View',
                submenu: [
                    {
                        label: 'Open',
                        accelerator: 'Command+O',
                        click: function () {
                            if (mainWindow === null) {
                                createWindow();
                            }
                        }
                    },
                    {
                        label: 'Reload',
                        accelerator: 'Command+R',
                        click: function () {
                            mainWindow.restart();
                        }
                    },
                    {
                        label: 'Toggle Full Screen',
                        accelerator: 'Ctrl+Command+F',
                        click: function () {
                            mainWindow.setFullScreen(!mainWindow.isFullScreen());
                        }
                    },
                    {
                        label: 'Toggle Developer Tools',
                        accelerator: 'Alt+Command+I',
                        click: function () {
                            mainWindow.toggleDevTools();
                        }
                    }
                ]
            }
        ]);
        Menu.setApplicationMenu(menu);
    } else {
        menu = Menu.buildFromTemplate([
            {
                label: '&View',
                submenu: [
                    {
                        label: '&Reload',
                        accelerator: 'Ctrl+R',
                        click: function () {
                            mainWindow.restart();
                        }
                    },
                    {
                        label: 'Toggle &Full Screen',
                        accelerator: 'F11',
                        click: function () {
                            mainWindow.setFullScreen(!mainWindow.isFullScreen());
                        }
                    },
                    {
                        label: 'Toggle &Developer Tools',
                        accelerator: 'Alt+Ctrl+I',
                        click: function () {
                            mainWindow.toggleDevTools();
                        }
                    }
                ]
            }
        ]);
        mainWindow.setMenu(menu);
    }
}

require('./server/FirmataSocketIO')(5480);

require('./server/Scrattino2');
