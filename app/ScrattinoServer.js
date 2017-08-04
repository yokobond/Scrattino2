/**
 * Created by ky on 2017/04/08.
 */

const http = require('http');
let server_port = 5410;
let server_ip = '127.0.0.1';

let pinIndexConf = ['D0', 'D1', 'D2', 'D3', 'D4', 'D5', 'D6', 'D7', 'D8', 'D9', 'D10', 'D11', 'D12', 'D13'];
let pinModeConf = {
  PULLDOWN: 0x00,
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

function ScrattinoServer(firmataService) {
  this.firmataService = firmataService;
}

ScrattinoServer.prototype.createServer = function () {
  let server = http.createServer();
  server.on('request', (req, res) => {
    let targetBoard = this.firmataService.getBoard(); // only one board can be used at this version.
    let content = '';
    if (targetBoard && targetBoard.transport.isOpen()) {
      let path = req.url.split('/');
      if (path[1] == 'poll') {
        let pinValue;
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
      } else if (path[1] == 'reset_all') {
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
      } else if (path[1] == 'pinValue') {
        let pinIndex = pinIndexConf.indexOf(path[2]);
        if (targetBoard.pins[pinIndex]) {
          let pinValue = targetBoard.pins[pinIndex].value;
          content += (pinValue ? pinValue : 0) + '\n';
        }
      } else if (path[1] == 'setMode') {
        let pinIndex = pinIndexConf.indexOf(path[2]);
        if (pinIndex > -1) {
          let pinMode = pinModeConf[path[3]];
          targetBoard.pinMode(pinIndex, pinMode, 1);
        }
      } else if (path[1] == 'digitalWrite') {
        let pinIndex = pinIndexConf.indexOf(path[2]);
        if (pinIndex > -1) {
          if (targetBoard.pins[pinIndex].mode !== pinModeConf['OUTPUT']) {
            targetBoard.pinMode(pinIndex, pinModeConf['OUTPUT']);
          }
          let pinValue = parseInt(path[3]);
          targetBoard.digitalWrite(pinIndex, pinValue);
        }
      } else if (path[1] == 'analogWrite') {
        let pinIndex = pinIndexConf.indexOf(path[2]);
        if (pinIndex > -1) {
          if (targetBoard.pins[pinIndex].mode !== pinModeConf['PWM']) {
            targetBoard.pinMode(pinIndex, pinModeConf['PWM']);
          }
          let pinValue = parseInt(path[3]);
          targetBoard.analogWrite(pinIndex, pinValue);
        }
      } else if (path[1] == 'servoWrite') {
        let pinIndex = pinIndexConf.indexOf(path[2]);
        if (pinIndex > -1) {
          if (targetBoard.pins[pinIndex].mode !== pinModeConf['SERVO']) {
            targetBoard.pinMode(pinIndex, pinModeConf['SERVO']);
          }
          let pinValue = parseInt(path[3]);
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

  server.start = function () {
    this.listen(server_port, server_ip);
  };

  return server;
};

module.exports = ScrattinoServer;