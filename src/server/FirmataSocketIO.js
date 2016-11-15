/**
 * Created by ky on 2016/05/12.
 */


module.exports = function (socketPort) {
    /**
     * Firmata configurations
     */
    var io = require('socket.io').listen(socketPort);;
    var fs = require('fs');


    /** detected ports for Arduino */
    var firmataPort = require('./FirmataPort.js');
    var firmataConfig = require('./FirmataConfig.js');

// on a socket connection
    io.on('connection', function (socket) {
        socket.emit("connected");
        socket.on("scanPorts",
            function () {
                firmataPort.scanPorts(
                    function (list) {
                        socket.emit("portList", list);
                    },
                    function (err) {
                        console.log(err);
                    }
                );
            }
        );
        

        function connectOnPort(portName) {
            firmataPort.boardOn(
                portName,
                function (connected) {
                    socket.board = connected;
                    socket.emit("board", {port: socket.board.transport.path, pins: socket.board.pins});
                    socket.board.setSamplingInterval(10);
                    // It's too heavy
                    // socket.board.on('analog-read', function (pinIndex, pinValue) {
                    //     socket.emit('BoardIsAlive', true);
                    //     socket.emit('boardPinsValueChanged', socket.board.pins);
                    // });


                    function startReporting() {
                        if (socket.reportingInterval) {
                            clearInterval(socket.reportingInterval);
                        }
                        /** Interval time of analog reporting [ms]*/
                        var reportingTime = 40; // The reporting was stacked at '0' waiting time.
                        socket.reportingInterval = setInterval(
                            function () {
                                if (!socket.board) {
                                    return;
                                }
                                if (socket.board.isAlive) {
                                    socket.emit('boardPinsValueChanged', socket.board.pins);
                                } else {
                                    socket.emit('BoardIsAlive', false);
                                }
                            },
                            reportingTime
                        );
                    }

                    startReporting();
                },
                function (err) {
                    socket.board = null;
                    console.log("selectPort: " + err);
                    socket.emit("board", {port: null});
                }
            );
        }

        socket.on('selectPort', connectOnPort);

        socket.on('clearPinMode',
            /**
             * Set the mode of the pin is not selected.
             * It set the mode INPUT without reporting then 'undefined' it.
             * @param data.pinIndex
             */
            function (data) {
                //socket.board.setPinMode(data.pinIndex, socket.board.MODES.INPUT, 0);
                socket.board.setPinMode(data.pinIndex, socket.board.MODES.INPUT, 1);  // set reporting on cause firmata.js stops all other reporting. Is it bug?
                socket.board.pins[data.pinIndex].mode = undefined;
                socket.emit("boardPinsModeChanged", socket.board.pins);
            }
        );

        socket.on('setPinMode', function (data) {
            socket.board.setPinMode(data.pinIndex, data.pinMode, 1);
            socket.emit("boardPinsModeChanged", socket.board.pins);
        });

        socket.on('analogWrite', function (data) {
            socket.board.analogWrite(data.pinIndex, data.pinValue);
        });

        socket.on('digitalWrite', function (data) {
            socket.board.digitalWrite(data.pinIndex, (data.pinValue == socket.board.LOW ? socket.board.LOW : socket.board.HIGH));
        });

        socket.on('setPinState', function (data) {
            socket.board.setPinState(data.pinIndex, data.pinState);
        });

        socket.on('savePinsConfig', function () {
            firmataConfig.setBoardConfig('default', socket.board.getPinsConfig());
            firmataConfig.saveConfig();
        });

        socket.on('applyConfig', function (configId) {
            socket.board.applyConfig(firmataConfig.getBoardConfig(configId));
            setTimeout(
                function () {
                    socket.emit("boardPinsModeChanged", socket.board.pins);
                },
                300);
        });

    });
};