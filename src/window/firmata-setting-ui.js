/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */


function updateSettingBoardState() {
    var boardConnectedElm = document.getElementById("boardConnected");
    if (!boardConnectedElm) {
        return;
    }
    var buttons;
    if (BOARD.connected) {
        boardConnectedElm.innerHTML = "<span style='color:#006eff'>ON-Line</span>";
        buttons = document.getElementsByName("initPinsButton");
        for (var i = 0; i < buttons.length; i++) {
            buttons[i].disabled = false;
        }
        buttons = document.getElementsByName("savePinsConfigButton");
        for (var i = 0; i < buttons.length; i++) {
            buttons[i].disabled = false;
        }
    } else {
        boardConnectedElm.innerHTML = "<span style='color:#ff4802'>OFF-Line</span>";
        buttons = document.getElementsByName("initPinsButton");
        for (var i = 0; i < buttons.length; i++) {
            buttons[i].disabled = true;
        }
        buttons = document.getElementsByName("savePinsConfigButton");
        for (var i = 0; i < buttons.length; i++) {
            buttons[i].disabled = true;
        }
    }
}

function updateSettingBoardPins() {
    if (!BOARD.changed) {
        return;
    }
    initPinsElement();
    for (var pinIndex = 0; pinIndex < BOARD.pins.length; pinIndex++) {
        var pinData = BOARD.pins[pinIndex];
        var elms = document.getElementsByName("pinMode" + pinIndex);
        for (var i = 0; i < elms.length; i++) {
            var pinModeElm = elms[i];
            pinModeElm.setAttribute("pinIndex", pinIndex.toString());
            var len = pinModeElm.options.length;
            for (var i = 0; i < len; i++) {
                pinModeElm.options[i] = null;
            }
            pinModeElm.options[0] = new Option("", -1);
            for (var i = 0; i < pinData.supportedModes.length; i++) {
                var modeText = null;
                for (var key in BOARD.MODES) {
                    if (BOARD.MODES[key] == pinData.supportedModes[i]) {
                        modeText = key;
                        break;
                    }
                }
                if (modeText === null) {
                    modeText = pinData.supportedModes[i].toString(16);
                }
                var newOption = new Option(modeText, pinData.supportedModes[i]);
                newOption.setAttribute("pinIndex", pinIndex.toString());
                pinModeElm.options[i + 1] = newOption;
            }
            pinModeElm.onchange = function (event) {
                var pin = Number(this.getAttribute("pinIndex"));
                if (this.value == -1) {
                    clearPinMode(pin);
                } else {
                    setPinMode(pin, Number(this.value));
                }
            };
            if (pinData.mode != null) {
                pinModeElm.value = pinData.mode;
            }
        }
        elms = document.getElementsByClassName('pinValue');
        for (var i = 0; i < elms.length; i++) {
            var pinValueHolder = elms[i];
            if (Number(pinValueHolder.getAttribute('pinIndex')) != pinIndex) {
                continue;
            }
            while (pinValueHolder.firstChild) {
                pinValueHolder.removeChild(pinValueHolder.firstChild);
            }
            var pinValueElm;
            if (pinData.mode == BOARD.MODES.PWM) {
                pinValueElm = (document.createElement('input'));
                pinValueElm.setAttribute('type', 'range');
                pinValueElm.setAttribute('min', 0);
                pinValueElm.setAttribute('max', 255);
                pinValueElm.setAttribute('step', 1);
                var pinValueLabel = document.createElement('span');
                pinValueLabel.innerHTML = pinData.value.toString();
                pinValueElm.onchange = function (event) {
                    var pin = Number(this.getAttribute("pinIndex"));
                    analogWrite(pin, Number(this.value));
                    pinValueLabel.innerHTML = this.value.toString();
                };
                pinValueHolder.appendChild(pinValueElm);
                pinValueHolder.appendChild(pinValueLabel);
            } else if ((pinData.mode == BOARD.MODES.INPUT) || (pinData.mode == BOARD.MODES.PULLUP)) {
                pinValueElm = (document.createElement('input'));
                pinValueElm.setAttribute('type', 'number');
                pinValueElm.readOnly = true;
                pinValueHolder.appendChild(pinValueElm);
            } else if (pinData.mode == BOARD.MODES.OUTPUT) {
                pinValueElm = (document.createElement('select'));
                pinValueElm.options[0] = new Option('low', 0);
                pinValueElm.options[1] = new Option('high', 1);
                pinValueElm.onchange = function (event) {
                    var pin = Number(this.getAttribute('pinIndex'));
                    digitalWrite(pin, Number(this.value));
                };
                pinValueHolder.appendChild(pinValueElm);
            } else if (pinData.mode == BOARD.MODES.ANALOG) {
                pinValueElm = (document.createElement('input'));
                pinValueElm.setAttribute('type', 'number');
                pinValueElm.readOnly = true;
                pinValueHolder.appendChild(pinValueElm);
            } else {
                pinValueElm = (document.createElement('input'));
                pinValueElm.setAttribute('type', 'number');
                pinValueHolder.appendChild(pinValueElm);
            }
            pinValueElm.setAttribute('pinIndex', pinIndex.toString());
            pinValueElm.name = "pinValue" + pinIndex;
            pinValueElm.value = pinData.value;
        }
        // TODO: remove after the PULLUP mode works
        elms = document.getElementsByName('pinState' + pinIndex);
        for (var i = 0; i < elms.length; i++) {
            var pinStateElm = elms[i];
            pinStateElm.value = pinData.state | 0;
            pinStateElm.readOnly = (pinData.mode != BOARD.MODES.INPUT);
            pinStateElm.style.visibility = pinStateElm.readOnly ? 'hidden' : 'visible';
        }
    }
    BOARD.changed = false;
}

function updateSettingBoardPinValues() {
    for (var pinIndex = 0; pinIndex < BOARD.pins.length; pinIndex++) {
        var elms = document.getElementsByName("pinValue" + pinIndex);
        for (var i = 0; i < elms.length; i++) {
            var elm = elms[i];
            elm.value = BOARD.pins[pinIndex].value;
        }
        elms = document.getElementsByName('pinState' + pinIndex);
        for (var i = 0; i < elms.length; i++) {
            var pinStateElm = elms[i];
            pinStateElm.value = BOARD.pins[pinIndex].state | 0;
        }
    }
}


function initPinsElement() {
    var elms = document.getElementsByName('pins');
    for (var i = 0; i < elms.length; i++) {
        var pinsHolder = elms[i];
        pinsHolder.classList.add('pure-form');
        pinsHolder.classList.add('pure-form-aligned');
        //pinsHolder.body.classList.add('pure-g');
        pinsHolder.innerHTML = "";
        // visiblePins.forEach(function (pinIndex) {
        for (var pinIndex = 2; pinIndex < BOARD.pins.length; pinIndex++) {
            if (!BOARD.pins[pinIndex]) {
                continue;
            }
            if (BOARD.pins[pinIndex].supportedModes.length == 0) {
                continue;
            }
            var pinElm = document.createElement('div');
            pinElm.name = "pin" + pinIndex;
            var labelElm = document.createElement('label');
            labelElm.textContent = 'pin' + pinIndex;
            pinElm.appendChild(labelElm);
            var pinModeElm = document.createElement('select');
            pinModeElm.name = "pinMode" + pinIndex;
            pinElm.appendChild(pinModeElm);
            var pinValueElm = document.createElement('span');
            pinValueElm.classList.add('pinValue');
            pinValueElm.setAttribute('pinIndex', pinIndex.toString());
            pinElm.appendChild(pinValueElm);
            var pinStateElm = document.createElement('select');
            pinStateElm.name = 'pinState' + pinIndex;
            pinStateElm.setAttribute('pinIndex', pinIndex.toString());
            pinStateElm.onchange = function (event) {
                var pin = Number(this.getAttribute('pinIndex'));
                setPinState(pin, Number(this.value));
            };
            pinStateElm.options[0] = new Option(0, 0);
            pinStateElm.options[1] = new Option(1, 1);
            pinElm.appendChild(pinStateElm);
            pinsHolder.appendChild(pinElm);
            pinElm.classList.add('pure-control-group');
            //labelElm.classList.add('pure-input-1-8');
            //pinModeElm.classList.add('pure-input-1-8');
            //pinValueElm.classList.add('pure-input-1-4');
            //pinStateElm.classList.add('pure-input-1-8');
        };
    }
}
initPinsElement();


(function () {
    var requestAnimationFrame = window.requestAnimationFrame || window.mozRequestAnimationFrame ||
        window.webkitRequestAnimationFrame || window.msRequestAnimationFrame;
    window.requestAnimationFrame = requestAnimationFrame;
})();

var updateDisplayInterval = 200;
var lastUpdateDisplay = Date.now();
function updateDisplay(timestamp) {
    var now = Date.now();
    var noUpdate = now - lastUpdateDisplay;
    if (noUpdate > updateDisplayInterval) {
        updateSettingBoardState();
        updateSettingBoardPins();
        updateSettingBoardPinValues();
        BOARD.connected = false;
        lastUpdateDisplay = now;
    }
    requestAnimationFrame(updateDisplay);
}
requestAnimationFrame(updateDisplay);
