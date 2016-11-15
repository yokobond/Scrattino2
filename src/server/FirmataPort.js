/**
 * Created by ky on 2015/03/28.
 */

var firmata = require('firmata');
var serial = require('serialport');

var firmataConfig = require('./FirmataConfig.js');

var heartBeatRate = 1000;

/** detected ports for Firmata */
var ports = [];
/** connected boards */
var boards = [];

/** port name filter for Arduino (ttyUSB#, cu.usbmodem#, COM#) */
var arduinoPortFilter = /usb|acm|^com/i;

function scanPorts(success, failure) {
    ports = [];
    serial.list(function (err, allPorts) {
        if (err) {
            failure(err);
            return;
        }
        allPorts.forEach(function (port) {
            if (arduinoPortFilter.test(port.comName)) {
                console.log("found arduino: ", port.comName);
                if (ports.indexOf(port.comName) < 0) {
                    ports.push(port.comName);
                }
            }
        });
        success(ports);
    });
}

var waitingForReady = false;

function boardOn(portName, success, failure) {
    if (waitingForReady) {
        failure("waiting for Ready");
        return;
    }
    if (ports.indexOf(portName) < 0) {
        failure("no port");
        return;
    }
    var targetBoard = boards.find(
        function (board) {
            return portName == board.transport.path;
        }
    );
    if (targetBoard) {
        if (targetBoard.isAlive) {
            success(targetBoard);
            return;
        } else {
            closeBoard(targetBoard);
        }
    }
    waitingForReady = true;
    var newBoard;
    console.log("try to connect: " + portName);
    try {
        newBoard = new firmata.Board(portName, function (err) {
            if (err) {
                console.log(err);
                failure(err);
                waitingForReady = false;
            }
        });
    } catch (ex) {
        failure(ex);
        waitingForReady = false;
        return;
    }
    newBoard.on("ready", function () {
        console.log("Ready: " + this.sp.path);
        initializeBoard(newBoard);
        var emptyIndex = 0;
        while (boards[emptyIndex]) {
            emptyIndex++;
        }
        boards[emptyIndex] = newBoard;
        success(newBoard);
        waitingForReady = false;
    });
}

function initializeBoard(board) {
    board.pinMode(board.analogPins[0], board.MODES.ANALOG);
    board.pinMode(board.analogPins[1], board.MODES.ANALOG);
    board.pinMode(board.analogPins[2], board.MODES.ANALOG);
    board.pinMode(board.analogPins[3], board.MODES.ANALOG);
    board.pinMode(board.analogPins[4], board.MODES.ANALOG);
    board.pinMode(board.analogPins[5], board.MODES.ANALOG);
    board.isAlive = true;
    board.heartbeat = setInterval(
        function () {
            board.isAlive = false;
        },
        heartBeatRate);
    board.sp.on("data", function (data) {
        board.isAlive = true;
    });
    board.sp.on('error', function () {
        board.close();
    });
    board.applyConfig(firmataConfig.getBoardConfig('default'));
}

function closeBoard(toRemove) {
    boards.forEach(
        function (board, index) {
            if (board === toRemove) {
                boards[index] = null;
            }
        }
    );
    toRemove.isAlive = false;
    clearInterval(toRemove.heartbeat);
    toRemove.transport.close(
        function (err) {
            if (err) {
                console.log(err);
            }
        }
    );
}

function closePort(portName) {
    boards.forEach(
        function (board, index) {
            if (board.transport.path == portName) {
                closeBoard(board);
                return;
            }
        }
    );
}

firmata.Board.prototype.analogPinIndex = function (pinIndex) {
    for (var i = 0; i < this.analogPins.length; i++) {
        if (pinIndex == this.analogPins[i]) {
            return i;
        }
    }
    return -1;
};

firmata.Board.prototype.setPinMode = function (pinIndex, pinMode, pinReporting) {
    try {
        if (pinMode == 0x0B) {
            // MODE = PULLUP
            // Use setPinState to 1 instead of setMode to PULLUP
            // cause setMode to PULLUP does not work in firmata.js 0.12.0 and firmata 2.5.2
            this.pinMode(pinIndex, this.MODES.INPUT);
            this.setPinState(pinIndex, 1);
        } else
        if (pinMode == this.MODES.INPUT) {
            this.pinMode(pinIndex, pinMode);
            this.setPinState(pinIndex, 0);
        } else {
            if (pinMode == null) {
                this.pinMode(pinIndex, null);
            } else {
                if (this.pins[pinIndex].supportedModes.indexOf(pinMode) < 0) {
                    // Not supported mode
                    var modeText = null;
                    for (var key in this.MODES) {
                        if (this.MODES[key] === pinMode) {
                            modeText = key;
                            break;
                        }
                    }
                    if (modeText == null) {
                        modeText = '0x' + pinMode.toString(16);
                    }
                    console.log('Pin ' + pinIndex + ' does not support mode ' + modeText);
                    this.pinMode(pinIndex, this.MODES.INPUT);
                    this.setPinState(pinIndex, 0);
                } else {
                    this.pinMode(pinIndex, pinMode);
                }
            }
        }
    } catch (ex) {
        console.error("error on setPinMode: " + ex);
    }
    if (pinMode == this.MODES.ANALOG) {
        var analogPinIndex = this.analogPinIndex(pinIndex);
        if (analogPinIndex < 0) {
            console.error("[" + this.sp.path + "] Invalid analog pin index " + pinIndex + " at 'setPinMode'");
            return;
        }
        this.reportAnalogPin(analogPinIndex, pinReporting);
    } else {
        this.reportDigitalPin(pinIndex, pinReporting);
    }
    console.log("[" + this.sp.path + "] Set pin" + pinIndex + " mode " + pinMode + (pinReporting ? " with reporting." : " without reporting."));
};

firmata.Board.prototype.close = function () {
    closeBoard(this);
    delete this;
};

module.exports =
{
    ports: ports,
    boards: boards,
    scanPorts: scanPorts,
    boardOn: boardOn,
    closeBoard: closeBoard,
    closePort: closePort
};
