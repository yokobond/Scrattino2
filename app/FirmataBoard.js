/**
 * Created by ky on 2016/12/19.
 */

const Board = require('firmata');

function FirmataBoard() {
  Board.apply(this, arguments);
}

FirmataBoard.prototype = Object.create(Board.prototype);

FirmataBoard.prototype.pinMode = function (pinIndex, pinMode, ...args) {
  const pinReporting = 1;
  switch (pinMode) {
    case this.MODES.PULLUP:
      let pullupWorkaround = false;
      if (pullupWorkaround) {
        // Use setPinState to 1 instead of setMode to PULLUP
        // cause setMode to PULLUP does not work in firmata.js 0.12.0 and firmata 2.5.2
        Board.prototype.pinMode.call(this, pinIndex, pinMode);
        this.digitalWrite(pinIndex, this.HIGH);
      } else {
        Board.prototype.pinMode.call(this, pinIndex, pinMode);
      }
      this.reportDigitalPin(pinIndex, pinReporting);
      break;
    case this.MODES.INPUT:
      Board.prototype.pinMode.call(this, pinIndex, pinMode);
      this.digitalWrite(pinIndex, this.LOW);
      this.reportDigitalPin(pinIndex, pinReporting);
      break;
    case this.MODES.ANALOG:
      const analogPinIndex = this.analogPins.findIndex((value) => (value === pinIndex));
      if (analogPinIndex < 0) {
        logError("[" + this.transport.path + "] Invalid analog pin index " + pinIndex + " in 'setPinMode()'");
        return;
      }
      Board.prototype.pinMode.call(this, pinIndex, pinMode);
      this.reportAnalogPin(analogPinIndex, pinReporting);
      break;
    case this.MODES.SERVO:
      if (args[0] && args[1]) {
        Board.prototype.servoConfig.call(this, pinIndex, args[0], args[1]);
        this.pins[pinIndex].servo = {min: args[0], max: args[1]};
      } else {
        // Use default servo angles.
        Board.prototype.pinMode.call(this, pinIndex, pinMode);
      }
      break;
    default:
      Board.prototype.pinMode.call(this, pinIndex, pinMode);
  }
};

module.exports = FirmataBoard;