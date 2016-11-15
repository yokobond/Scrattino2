/**
 * Created by ky on 2015/05/31.
 */

var firmataDisplayCanvas;
var firmataDisplayContext;
var drawingTop = 20;
var labelLeft = 8;
var labelWidth = 128;
var dScopeHeight = 20;
var aScopeHeight = 100;
var Ain0 = 18;
var penX = labelLeft + labelWidth + 4;
var penSpeed = 1;

function drawFirmataDisplay() {
    if (BOARD.changed) {
        initPens(firmataDisplayContext);
        BOARD.changed = false;
    }
    if (BOARD.connected) {
        firmataDisplayContext.clearRect(0, 0, firmataDisplayCanvas.width, firmataDisplayCanvas.height);
        drawingTop = 20;
        penX = penX + penSpeed;
        if (penX > firmataDisplayCanvas.width) {
            penX = labelLeft + labelWidth + 4;
            Object.keys(pens).forEach(function (key) {
                var pen = pens[key];
                pen.penUp().move(penX, pen.y);
                pen.clearPath();
            });
        }
        var pinValue = 0;
        // for (var i = 2; i < 13; i++) {
        //     pinValue = BOARD.pins[i].value;
        //     drawingTop = drawingTop + dScopeHeight;
        //     firmataDisplayContext.textAlign = "left";
        //     firmataDisplayContext.fillText("Pin" + (i), labelLeft, drawingTop);
        //     firmataDisplayContext.textAlign = "right";
        //     firmataDisplayContext.fillText(" [" + pinValue + "]", labelLeft + labelWidth, drawingTop);
        //     pens[i].penDown().move(penX, drawingTop - (pinValue * 10)).draw();
        // }
        BOARD.pins.forEach(function (pin, pinIndex) {
            if (pinIndex > 1) {
                if (pin.analogChannel == 0x7F) {
                    pinValue = pin.value;
                    drawingTop = drawingTop + dScopeHeight;
                    firmataDisplayContext.textAlign = "left";
                    var modeText = null;
                    if (pin.mode == null) {
                        modeText = 'N/A';
                    } else
                    if (pin.mode == BOARD.MODES['INPUT']) {
                        if (pin.state == 1) {
                            modeText = 'INPUT_PULLUP';
                        } else {
                            modeText = 'INPUT';
                        }
                    } else {
                        for (var key in BOARD.MODES) {
                            if (BOARD.MODES[key] === pin.mode) {
                                modeText = key;
                                break;
                            }
                        }
                        if (modeText === null) {
                            modeText = pin.mode.toString(16);
                        }
                    }
                    firmataDisplayContext.fillText("D" + pinIndex + ' [ ' + modeText + ' ]', labelLeft, drawingTop);
                    firmataDisplayContext.textAlign = "right";
                    firmataDisplayContext.fillText(" [" + pinValue + "]", labelLeft + labelWidth, drawingTop);
                    pens[pinIndex].penDown().move(penX, drawingTop - (pinValue * 10)).draw();
                } else {
                    pinValue = pin.value;
                    drawingTop = drawingTop + aScopeHeight;
                    firmataDisplayContext.textAlign = "left";
                    firmataDisplayContext.fillText("Pin" + (pinIndex) + "(A" + pin.analogChannel + ")", labelLeft, drawingTop + 10);
                    firmataDisplayContext.textAlign = "right";
                    firmataDisplayContext.fillText(" [" + pinValue + "]", labelLeft + labelWidth, drawingTop + 10);
                    pens[pinIndex].penDown().move(penX, drawingTop + 10 - (pinValue / 10)).draw();
                    var smoothPen = pens[pinIndex + "-smooth"];
                    var smoothSamples = smoothPen.samples;
                    smoothSamples.push(pinValue);
                    if (smoothSamples.length > 12) {
                        smoothSamples.shift();
                    }
                    smoothPen.penDown().move(penX, drawingTop + 10 - (average(smoothSamples) / 10)).draw();
                }
            }
        });
        // for (var i = 0; i < 6; i++) {
        //     pinValue = BOARD.pins[Ain0 + i].value;
        //     drawingTop = drawingTop + aScopeHeight;
        //     firmataDisplayContext.textAlign = "left";
        //     firmataDisplayContext.fillText("Pin" + (Ain0 + i) + "(A" + i + ")", labelLeft, drawingTop + 10);
        //     firmataDisplayContext.textAlign = "right";
        //     firmataDisplayContext.fillText(" [" + pinValue + "]", labelLeft + labelWidth, drawingTop + 10);
        //     pens[Ain0 + i].penDown().move(penX, drawingTop + 10 - (pinValue / 10)).draw();
        //     var smoothPen = pens[Ain0 + i + "-smooth"];
        //     var smoothSamples = smoothPen.samples;
        //     smoothSamples.push(pinValue);
        //     if (smoothSamples.length > 12) {
        //         smoothSamples.shift();
        //     }
        //     smoothPen.penDown().move(penX, drawingTop + 10 - (average(smoothSamples) / 10)).draw();
        // }
    }
}

function setupFirmataDisplay() {
    firmataDisplayCanvas = document.getElementById('firmata-display');
    if (firmataDisplayCanvas.getContext) {
        firmataDisplayContext = firmataDisplayCanvas.getContext('2d');
        // initPens(firmataDisplayContext, penX, 0);
    }
}

var pens = {};

function initPens(context) {
    pens = [];
    BOARD.pins.forEach(function (pin, pinIndex) {
        if (pinIndex > 1) {
            if (pin.analogChannel == 0x7F) {
                // digital
                pens[pinIndex] = new Pen(context);
            } else {
                // analog
                var newPen = new Pen(context);
                pens[pinIndex] = newPen;
                newPen = new Pen(context);
                newPen.strokeStyle = "rgba(255, 0, 0, 0.75)";
                newPen.samples = [];
                pens[pinIndex + "-smooth"] = newPen;
            }
        }
    });
    // firmataDisplayDigital.forEach(function (pinIndex) {
    //     pens[pinIndex] = new Pen(context);
    // });
    // firmataDisplayAnalog.forEach(function (pinIndex) {
    //     var newPen = new Pen(context)
    //     pens[pinIndex] = newPen;
    //     newPen = new Pen(context);
    //     newPen.strokeStyle = "rgba(255, 0, 0, 0.75)";
    //     newPen.samples = [];
    //     pens[pinIndex + "-smooth"] = newPen;
    // });
}

var median = function (arr, fn) {
    var half = (arr.length / 2) | 0;
    var sorted = arr.slice(0).sort(fn);
    if (sorted.length % 2) {
        return sorted[half];
    }
    return (sorted[half - 1] + sorted[half]) / 2;
};

var average = function (arr) {
    var sum = 0, j = 0;
    for (var i = 0; i < arr.length, isFinite(arr[i]); i++) {
        sum += arr[i];
        ++j;
    }
    return j ? sum / j : 0;
};


function Pen(context) {
    this.context = context;
    this.path = [];
    this.strokeStyle = "#000000";
    this.lineWidth = 1;
    this.drawing = false;
}

Pen.prototype.x = function () {
    if (this.path.length > 0) {
        return this.path[this.path.length - 1].x;
    } else {
        return null;
    }
};

Pen.prototype.y = function () {
    if (this.path.length > 0) {
        return this.path[this.path.length - 1].y;
    } else {
        return null;
    }
};

Pen.prototype.penDown = function () {
    this.drawing = true;
    return this;
};

Pen.prototype.penUp = function () {
    this.drawing = false;
    return this;
};

Pen.prototype.move = function (x, y) {
    this.path.push({x: x, y: y, drawing: this.drawing});
    return this;
};

Pen.prototype.draw = function () {
    this.context.strokeStyle = this.strokeStyle;
    this.context.lineWidth = this.lineWidth;
    this.context.beginPath();
    this.context.moveTo(this.path[0].x, this.path[0].y);
    for (var i = 1; i < this.path.length; i++) {
        if (this.path[i].drawing) {
            this.context.lineTo(this.path[i].x, this.path[i].y);
        } else {
            this.context.moveTo(this.path[i].x, this.path[i].y);
        }
    }
    this.context.stroke();
    return this;
};

Pen.prototype.clearPath = function () {
    if (this.path.length > 0) {
        this.path = [this.path[this.path.length - 1]];
    }
    return this;
};
