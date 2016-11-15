/**
 * Created by ky on 2015/03/29.
 */

var BOARD;

var socket = require('socket.io-client')('http://localhost:5480');

socket.on('connected', function () {
    console.log("connected");
    serverScanPorts();
});

function serverScanPorts() {
    socket.emit('scanPorts');
    //initBoard();
    //board.changed = true;
}

function reconnect() {
    selectPort(document.getElementById("portList").value);
}

function selectPort(portName) {
    //initBoard();
    socket.emit("selectPort", portName);
}

function applyConfig() {
    if (!BOARD || !BOARD.connected) {
        console.error("not connected");
        return;
    }
    if (window.confirm("Do you initialize Pins config?")) {
        socket.emit('applyConfig', 'default');
    }
}

function saveConfig() {
    if (!BOARD || !BOARD.connected) {
        console.error("not connected");
        return;
    }
    if (window.confirm("Do you save this Pins config?")) {
        socket.emit('savePinsConfig');
    }
}

function setPinMode(pinIndex, pinMode) {
    var modeValue = (typeof pinMode === 'string') ? BOARD.MODES[pinMode] : pinMode;
    socket.emit('setPinMode', {pinIndex: pinIndex, pinMode: modeValue});
}

function clearPinMode(pinIndex) {
    socket.emit('clearPinMode', {pinIndex: pinIndex});
}

function setPinState(pinIndex, pinState) {
    socket.emit('setPinState', {pinIndex: pinIndex, pinState: pinState});
}

function analogWrite(pinIndex, pinValue) {
    socket.emit('analogWrite', {pinIndex: pinIndex, pinValue: pinValue});
}

function digitalWrite(pinIndex, pinValue) {
    socket.emit('digitalWrite', {pinIndex: pinIndex, pinValue: pinValue});
}

socket.on('portList', function (list) {
    var elm = document.getElementById("portList");
    if (!elm) {
        return;
    }
    var length = elm.options.length;
    for (var i = 0; i < length; i++) {
        elm.options[i] = null;
    }
    elm.options[0] = new Option("", "");
    for (var i = 0; i < list.length; i++) {
        elm.options[i + 1] = new Option(list[i], list[i]);
    }
    elm.onchange = function () {
        selectPort(this.value);
    };
    // select first found board
    if (elm.options.length > 1) {
        elm.selectedIndex = 1;
        selectPort(elm.options[1].value);
    }
});

function initBoard() {
    BOARD = {port: null, pins: [], connected: false, changed: false};
    BOARD.MODES = {
        INPUT: 0x00,
        OUTPUT: 0x01,
        ANALOG: 0x02,
        PWM: 0x03,
        SERVO: 0x04,
        SHIFT: 0x05,
        I2C: 0x06,
        ONEWIRE: 0x07,
        STEPPER: 0x08,
        ENCODER: 0x09,
        SERIAL: 0x0A,
        PULLUP: 0x0B,
        IGNORE: 0x7F,
        UNKOWN: 0x10
    };
    BOARD.valueChangeListeners = [];

    BOARD.addValueChangeListener = function (pinIndex, fn) {
        if (BOARD.valueChangeListeners[pinIndex]) {
            if (BOARD.valueChangeListeners[pinIndex].indexOf(fn) >= 0) {
                return;
            }
        } else {
            BOARD.valueChangeListeners[pinIndex] = [];
        }
        BOARD.valueChangeListeners[pinIndex].push(fn);
    };

    BOARD.updatePinsValue = function (newPins) {
        var oldPins = BOARD.pins;
        BOARD.pins = newPins;
        BOARD.valueChangeListeners.forEach(
            function (listeners, pinIndex) {
                if (oldPins[pinIndex].value != newPins[pinIndex].value) {
                    listeners.forEach(
                        function (listener) {
                            listener(pinIndex, newPins[pinIndex].value, oldPins[pinIndex].value);
                        }
                    );
                }
            }
        );
    }
}

initBoard();

socket.on('board',
    function (data) {
        if (data.port) {
            BOARD.port = data.port;
            document.getElementById("portList").value = data.port;
        } else {
            BOARD.port = null;
            document.getElementById("portList").value = "";
            BOARD.connected = false;
        }
        BOARD.pins = data.pins || [];
        BOARD.changed = true;
    }
);

socket.on('BoardIsAlive', function (state) {
    BOARD.connected = state;
});

socket.on("boardPinsModeChanged",
    function (pins) {
        BOARD.connected = true;
        BOARD.updatePinsValue(pins);
        BOARD.changed = true;
    }
);

socket.on('boardPinsValueChanged', function (pins) {
    BOARD.connected = true;
    BOARD.updatePinsValue(pins);
});

