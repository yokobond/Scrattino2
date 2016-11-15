/**
 * Created by ky on 2015/05/17.
 */

var firmata = require('firmata');
var fs = require('fs');
var firmataConfFileName = __dirname + '/../config/firmata/firmata.json';

try {
    var firmataConf = JSON.parse(fs.readFileSync(firmataConfFileName));
} catch (err) {
    console.log('There has been an error parsing your JSON.');
    console.log(err);
}
if (!firmataConf) {
    firmataConf = {boardConfigList: {}, boardConfigDefault: null};
}

firmata.Board.prototype.getPinsConfig = function () {
    var pinsConfig = [];
    Object.keys(this.pins).forEach(
        function (pinIndex) {
            var pin = this.pins[pinIndex];
            var pinCfg = {};
            if (pin.mode != this.MODES.UNKOWN || pin.mode != this.MODES.IGNORE) {
                pinsConfig[pinIndex] = pinCfg;
                pinCfg.mode = pin.mode;
                if (pin.mode == this.MODES.INPUT) {
                    pinCfg.state = this.pins[pinIndex].state;
                    //this.queryPinState(pinIndex, function () {
                    //    pinCfg.state = this.pins[pinIndex].state;
                    //}.bind(this));
                } else if (pin.mode == this.MODES.OUTPUT) {
                    pinCfg.value = pin.value;
                } else if (pin.mode == this.MODES.PWM) {
                    pinCfg.value = pin.value;
                } else if (pin.mode == this.MODES.SERVO) {
                    pinCfg.value = pin.value;
                }
            }
        }.bind(this)
    );
    return pinsConfig;
};

firmata.Board.prototype.setPinState = function (pinIndex, pinState) {
    if ((this.pins[pinIndex].mode != this.MODES.INPUT) && (this.pins[pinIndex].mode != this.MODES.PULLUP)) {
        return;
    }
    this.digitalWrite(pinIndex, pinState);
    this.queryPinState(pinIndex, function () {
        console.log("pin " + pinIndex + " state: " + this.pins[pinIndex].state);
    }.bind(this));  // to update pins data
};

firmata.Board.prototype.applyConfig = function (config) {
    if (!config) {
        return;
    }
    var pinsConfig = config;
    var setPinConfig = function (board, pinIndex) {
        var pinCfg = pinsConfig[pinIndex];
        //board.setPinMode(pinIndex, pinCfg.mode, 1);
        if ((pinCfg.mode == board.MODES.INPUT) && pinCfg.state) {
            board.setPinState(pinIndex, pinCfg.state);
        } else if ((pinCfg.mode == board.MODES.OUTPUT) && pinCfg.value) {
            board.digitalWrite(pinIndex, pinCfg.value);
        } else if ((pinCfg.mode == board.MODES.PWM) && pinCfg.value) {
            board.analogWrite(pinIndex, pinCfg.value);
        } else if ((pinCfg.mode == board.MODES.SERVO) && pinCfg.value) {
            board.servoWrite(pinIndex, pinCfg.value);
        }
    };
    Object.keys(pinsConfig).forEach(
        function (pinIndex) {
            var board = this;
            var pinCfg = pinsConfig[pinIndex];
            board.setPinMode(pinIndex, pinCfg.mode, 1);
            setTimeout(
                function () {
                    setPinConfig(board, pinIndex);
                }
                , 100   // This wait avoids to fail setting values after changing pin-mode.
            );
        }.bind(this)
    );
};

function saveConfig() {
    fs.writeFile(firmataConfFileName, JSON.stringify(firmataConf), function (err) {
        if (err) {
            console.log('There has been an error saving your configuration data.');
            console.log(err.message);
            return;
        }
        console.log('Configuration saved successfully.')
    });
}

function setBoardConfig(id, boardCfg) {
    firmataConf.boardConfigList[id] = boardCfg;
}

function getBoardConfig(id) {
    return firmataConf.boardConfigList[id];
}

function removeBoardConfig(id) {
    var removal = firmataConf.boardConfigList[id];
    if (!removal) {
        return null;
    }
    delete firmataConf.boardConfigList[id];
    return removal;
}

function allBoardConfigIDs() {
    return Object.keys(firmataConf.boardConfigList);
}

module.exports =
{
    setBoardConfig: setBoardConfig,
    getBoardConfig: getBoardConfig,
    removeBoardConfig: removeBoardConfig,
    allBoardConfigIDs: allBoardConfigIDs,
    saveConfig: saveConfig
};