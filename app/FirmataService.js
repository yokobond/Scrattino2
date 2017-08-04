/**
 * Created by ky on 2016/11/28.
 */

const Board = require('./FirmataBoard');
const events = require('events');
const fs = require('fs');
const path = require('path');

function FirmataService(serialPort) {

  // OS serial port service
  this.serialPortService = serialPort;

  // serial port list
  this.portList = [];

  // Firmata Board list
  this.boardList = [];

  // Interval to update the state of ports
  this.portListing = [];
  this.portListingIntervalTime = 1000;
  this.portLostLimitTime = 2000;

  this.firmataConfig = {};

  /** port name filter for Arduino (ttyUSB#, cu.usbmodem#, COM#) */
  this.arduinoPortPathPattern = /usb|acm|^com/i;

  events.EventEmitter.call(this);
}

FirmataService.prototype = Object.create(events.EventEmitter.prototype);


FirmataService.prototype.findPortProp = function (path) {
  return this.portList.find(sp => (sp.path === path));
};

FirmataService.prototype.portListChanged = function () {
  this.emit('portListChanged', this.portList);
};

FirmataService.prototype.boardListChanged = function () {
  this.emit('boardListChanged');
};

FirmataService.prototype.setupPortProp = function (portProp, port) {
  port.on('open', () => {
    portProp.isOpen = true;
    this.portListChanged();
  });
  port.on('close', () => {
    portProp.isOpen = false;
    this.portListChanged();
  });
  port.on('error', (error) => {
    portProp.isOpen = false;
    this.portListChanged();
    logError(error);
  });
  port.on('disconnect', () => {
    this.detectPorts();
    this.portListChanged();
  });
};

// Create and add a new port to portList
FirmataService.prototype.addNewPort = function (portPath) {
  let newPortProp = {path: portPath};
  newPortProp.lastUpdate = Date.now();
  this.portList.push(newPortProp);
  logInfo('detected: ' + newPortProp.path);
  let port = new this.serialPortService(portPath, {baudRate: 57600, bufferSize: 256},
    (err) => {
      if (err) {
        newPortProp.isFirmata = false;
        newPortProp.portProtocol = 'N/A';
        newPortProp.portState = 'N/A';
        this.portListChanged();
        logInfo(err);
        return;
      }
      this.setupPortProp(newPortProp, port);
      let newBoard = new Board(
        port,
        (err) => {
          if (err) {
            port.close();
            newPortProp.isFirmata = false;
            newPortProp.portProtocol = 'Not Firmata';
            this.portListChanged();
            logInfo(err);
            return;
          }
          this.boardList.push(newBoard);
          this.boardListChanged();
          newPortProp.isFirmata = true;
          newPortProp.portProtocol = newBoard.firmware.name + ' v' + newBoard.firmware.version.major + '.' + newBoard.firmware.version.minor;
          port.close();
          this.portListChanged();
          logInfo("find firmata on " + newBoard.transport.path);
        });
    });
};

FirmataService.prototype.getBoard = function (portPath) {
  if (portPath) {
    return this.boardList.find(bd => (bd.transport.path === portPath));
  } else {
    return this.boardList[0];
  }
};

// List and add new found ports to portList.
FirmataService.prototype.detectPorts = function () {
  // this.boardList.forEach(board => {
  //   if (board.transport.isOpen()) {
  //     board.transport.close();
  //   }
  // });
  this.serialPortService.list((err, list) => {
    if (err) {
      logError("SerialPort could not list.");
      return;
    }
    list = list.filter(portMetaData => (portMetaData.comName.match(this.arduinoPortPathPattern)));
    const oldLength = this.portList.length;
    // Remove detached ports from portList.
    this.portList.filter(portProp => (list.find(portMetaData => portMetaData.comName === portProp.path) == null))
      .forEach(rmPortProp => {
        this.removePortProp(rmPortProp);
      });
    // Remove non-firmata ports from portList to re-connect.
    this.portList.filter(portProp => (!portProp.isFirmata))
      .forEach((rmPortProp => {
        this.removePortProp((rmPortProp));
      }));
    list.forEach((portMetaData) => {
      let portPath = portMetaData.comName;
      let port = this.findPortProp(portPath);
      if (port) {
        // This port has been connected as firmata.
        port.lastUpdate = Date.now();
      } else {
        this.addNewPort(portPath);
      }
    });
    if (oldLength !== this.portList.length) this.portListChanged();
  });
};

FirmataService.prototype.availablePorts = function (callback) {
  this.serialPortService.list((err, list) => {
    if (err) {
      logError("SerialPort could not list.");
      return;
    }
    callback(list);
  });
};

FirmataService.prototype.removePortProp = function (portProp) {
  const rmBoard = this.getBoard(portProp.path);
  if (rmBoard) this.removeBoard(rmBoard);
  this.portList = this.portList.filter(pp => (pp != portProp));
};

FirmataService.prototype.startPortListing = function () {
  this.portListing = setInterval(() => {
      this.detectPorts();
    },
    this.portListingIntervalTime);
  logInfo('startPortListing');
};

FirmataService.prototype.stopPortListing = function () {
  if (this.portListing) {
    clearInterval(this.portListing);
    this.portListing = null;
    logInfo('stopPortListing');
  }
};

function logError(message) {
  // TODO: Use log4js
  console.error(message);
}

function logInfo(message) {
  // TODO: Use log4js
  console.info(message);
}

FirmataService.prototype.removeLostPorts = function () {
  let now = Date.now();
  let old = this.portList;
  this.portList = this.portList.filter(port => ((now - port.lastUpdate) < this.portLostLimitTime));
  if (old.length != this.portList.length) {
    this.portListChanged();
  }
};

FirmataService.prototype.removeBoard = function (board) {
  if (board.transport.isOpen()) board.transport.close();
  let old = this.boardList;
  this.boardList = this.boardList.filter(bd => (bd !== board));
  if (old.length !== this.boardList.length) {
    this.boardListChanged();
  }
};

FirmataService.prototype.release = function () {
  this.stopPortListing();
  this.boardList.forEach((board) => {
    this.removeBoard(board);
  });
};

FirmataService.prototype.connectPort = function (portPath, success, failure) {
  let board = this.getBoard(portPath);
  if (board) {
    board.transport.open(
      (err) => {
        if (err) {
          logError(err);
          if (failure) failure(board);
          return;
        }
        if (success) success(board);
      }
    );
  } else {
    failure();
    logError("No board on: " + portPath);
  }
};

FirmataService.prototype.getBoardConfig = function (board) {
  let config = {};
  config.pins = [];
  Object.keys(board.pins).forEach(
    function (pinIndex) {
      const pin = board.pins[pinIndex];
      let pinCfg = {};
      if (pin.mode != null) {
        config.pins[pinIndex] = pinCfg;
        pinCfg.mode = pin.mode;
        switch (pin.mode) {
          case board.MODES.ANALOG :
            pinCfg.analogChannel = pin.analogChannel;
            break;
          case board.MODES.OUTPUT :
            pinCfg.value = pin.value;
            break;
          case board.MODES.PWM :
            pinCfg.value = pin.value;
            break;
          case board.MODES.SERVO :
            if (pin.servo) {
              pinCfg.servo = {min: pin.servo.min, max: pin.servo.max};
            }
            pinCfg.value = pin.value;
            break;
          default:
        }
      }
    }
  );
  // let config = board.pins.map((pin) => (Object.assign({}, pin)));
  return config;
};


FirmataService.prototype.applyBoardConfig = function (config, board) {
  Object.keys(config.pins).forEach(
    function (pinIndex) {
      let pinCfg = config.pins[pinIndex];
      if (!pinCfg) return;
      if (pinCfg.mode == board.MODES.ANALOG) {
        board.pinMode(board.analogPins[pinCfg.analogChannel], pinCfg.mode);
      } else {
        board.pinMode(pinIndex, pinCfg.mode);
      }
      switch (pinCfg.mode) {
        case board.MODES.OUTPUT :
          board.digitalWrite(pinIndex, pinCfg.value);
          break;
        case board.MODES.PWM :
          board.analogWrite(pinIndex, pinCfg.value);
          break;
        case board.MODES.SERVO :
          if (pinCfg.servo) {
            board.servoConfig(pinIndex, pinCfg.servo.min, pinCfg.servo.max);
          }
          board.servoWrite(pinIndex, pinCfg.value);
          break;
        default:
      }
    }
  );
};

FirmataService.prototype.readConfig = function (configPath, fileName) {
  try {
    this.firmataConfig[fileName] = JSON.parse(fs.readFileSync(path.join(configPath, fileName)));
  } catch (err) {
    console.error(err);
  }
};

FirmataService.prototype.saveConfig = function (config, fileName) {
  fs.writeFile(fileName, JSON.stringify(config), function (err) {
    if (err) {
      console.log('Error on saving configuration:' + err.message);
      return;
    }
    console.log('Configuration saved successfully on: ' + fileName)
  });
};

FirmataService.prototype.allBoardConfigIDs = function () {
  return Object.keys(this.firmataConfig);
};


module.exports = FirmataService;