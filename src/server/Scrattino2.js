/**
 * Created by ky on 2016/05/14.
 */

var http = require('http');
var server = http.createServer();
var server_port = 5410;
var server_ip = '127.0.0.1';

var firmataPort = require('./FirmataPort.js');
var targetBoardIndex = 0; // only one board can be used at this version.

var pinIndexConf = ['D0', 'D1', 'D2', 'D3', 'D4', 'D5', 'D6', 'D7', 'D8', 'D9', 'D10', 'D11', 'D12', 'D13'];
var pinModeConf = {
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
    INPUT_PULLUP: 0x0B,
    IGNORE: 0x7F,
    UNKOWN: 0x10
};

server.on('request', function(req, res) {
    var targetBoard = firmataPort.boards[targetBoardIndex];
    var content = '';
    if (targetBoard && targetBoard.isAlive) {
        var path = req.url.split('/');
        if (path[1] == 'poll') {
            var pinValue;
            pinValue = targetBoard.pins[2].value;
            content += 'd2 ' + (pinValue ? pinValue : 0) + '\n';
            pinValue = targetBoard.pins[3].value;
            content += 'd3 ' + (pinValue ? pinValue : 0) + '\n';
            pinValue = targetBoard.pins[4].value;
            content += 'd4 ' + (pinValue ? pinValue : 0) + '\n';
            pinValue = targetBoard.pins[5].value;
            content += 'd5 ' + (pinValue ? pinValue : 0) + '\n';
            pinValue = targetBoard.pins[6].value;
            content += 'd6 ' + (pinValue ? pinValue : 0) + '\n';
            pinValue = targetBoard.pins[7].value;
            content += 'd7 ' + (pinValue ? pinValue : 0) + '\n';
            pinValue = targetBoard.pins[8].value;
            content += 'd8 ' + (pinValue ? pinValue : 0) + '\n';
            pinValue = targetBoard.pins[9].value;
            content += 'd9 ' + (pinValue ? pinValue : 0) + '\n';
            pinValue = targetBoard.pins[10].value;
            content += 'd10 ' + (pinValue ? pinValue : 0) + '\n';
            pinValue = targetBoard.pins[11].value;
            content += 'd11 ' + (pinValue ? pinValue : 0) + '\n';
            pinValue = targetBoard.pins[12].value;
            content += 'd12 ' + (pinValue ? pinValue : 0) + '\n';
            pinValue = targetBoard.pins[13].value;
            content += 'd13 ' + (pinValue ? pinValue : 0) + '\n';
            pinValue = targetBoard.pins[targetBoard.analogPins[0]].value;
            content += 'a0 ' + (pinValue ? pinValue : 0) + '\n';
            pinValue = targetBoard.pins[targetBoard.analogPins[1]].value;
            content += 'a1 ' + (pinValue ? pinValue : 0) + '\n';
            pinValue = targetBoard.pins[targetBoard.analogPins[2]].value;
            content += 'a2 ' + (pinValue ? pinValue : 0) + '\n';
            pinValue = targetBoard.pins[targetBoard.analogPins[3]].value;
            content += 'a3 ' + (pinValue ? pinValue : 0) + '\n';
            pinValue = targetBoard.pins[targetBoard.analogPins[4]].value;
            content += 'a4 ' + (pinValue ? pinValue : 0) + '\n';
            pinValue = targetBoard.pins[targetBoard.analogPins[5]].value;
            content += 'a5 ' + (pinValue ? pinValue : 0) + '\n';
        } else
        if (path[1] == 'reset_all') {
            // Do something for the stop button pressed in Scratch.
            targetBoard.pins.forEach(function (pin, pinIndex) {
                if (pin.mode == targetBoard.MODES.INPUT) {
                    // Nothing to do.
                } else if (pin.mode == targetBoard.MODES.OUTPUT) {
                    targetBoard.digitalWrite(pinIndex, 0);
                } else if (pin.mode == targetBoard.MODES.PWM) {
                    targetBoard.analogWrite(pinIndex, 0);
                } else if (pin.mode == targetBoard.MODES.SERVO) {
                    targetBoard.servoWrite(pinIndex, 0);
                }
            });
        } else
        if (path[1] == 'setMode') {
            var pinIndex = pinIndexConf.indexOf(path[2]);
            if (pinIndex > -1) {
                var pinMode = pinModeConf[path[3]];
                targetBoard.setPinMode(pinIndex, pinMode, 1);
            }
        }
        if (path[1] == 'digitalWrite') {
            var pinIndex = pinIndexConf.indexOf(path[2]);
            if (pinIndex > -1) {
                var pinValue = parseInt(path[3]);
                targetBoard.digitalWrite(pinIndex, pinValue);
            }
        }
        if (path[1] == 'analogWrite') {
            var pinIndex = pinIndexConf.indexOf(path[2]);
            if (pinIndex > -1) {
                var pinValue = parseInt(path[3]);
                targetBoard.analogWrite(pinIndex, pinValue);
            }
        }
        if (path[1] == 'servoWrite') {
            var pinIndex = pinIndexConf.indexOf(path[2]);
            if (pinIndex > -1) {
                var pinValue = parseInt(path[3]);
                targetBoard.servoWrite(pinIndex, pinValue);
            }
        }
    } else {
        // no target board
        content = '_problem any Arduino is not connected.';
    }
    res.writeHead(200, {'Content-Type': 'text/plain'});
    res.write(content);
    res.end();
});

server.listen(server_port, server_ip);
