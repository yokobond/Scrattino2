/**
 * Created by ky on 2016/12/10.
 */

import React from 'react';
import { ipcRenderer } from 'electron';
import PinMode from './BoardPinMode';
import PinValue from './BoardPinValue';

const BoardMonitor = ({ board, selectedPort }) => {
  if (!selectedPort || !board || !board.isOpen) return <div className="alert alert-warning">Not Connected</div>;
  const digitalPins = [];
  const analogChannels = [];
  for (let i = 0; i < board.pins.length; i++) {
    if (board.pins[i].analogChannel === 127) {
      digitalPins.push(i);
    } else {
      analogChannels.push(i);
    }
  }
  return (
    <div className="board-monitor">
      {(() => (
        <div>
          <div className="row no-gutters">
            <div className="col-12">
              {
                (() => {
                  const pinsElem = [];
                  analogChannels.forEach((pinID) => {
                    pinsElem.push(<div className="pin analog" key={pinID}>
                      <label className="pin-label" htmlFor={`pin${pinID}`}>
                        A{board.pins[pinID].analogChannel}
                      </label>
                      <div className="pin-mode" id={`pin${pinID}`}>
                        <PinMode board={board} pinIndex={pinID} />
                      </div>
                      <div className="pin-value">
                        <PinValue board={board} pinIndex={pinID} />
                      </div>
                    </div>);
                  });
                  return pinsElem;
                })()
              }
            </div>
            <div className="col-12">
              <div className="row no-gutters">
                {
                  (() => {
                    const pinsElem = [];
                    digitalPins.forEach((pinID, index) => {
                      pinsElem.push(<div className="col-6">
                        <div className="pin" key={pinID}>
                          <label className="pin-label" htmlFor={`pin${pinID}`}>
                            D{pinID}
                          </label>
                          <div className="pin-mode" id={`pin${pinID}`}>
                            <PinMode board={board} pinIndex={pinID} />
                          </div>
                          <div className="pin-value">
                            <PinValue board={board} pinIndex={pinID} />
                          </div>
                        </div>
                      </div>);
                    });
                    return pinsElem;
                  })()
                }
              </div>
            </div>
          </div>
          <div className="row gutters">
            <div className="col-8" />
            <div className="col-4">
              <button
                type="button"
                className="btn btn-default"
                disabled={!board.isOpen}
                onClick={() => {
                  ipcRenderer.send('saveBoardConfig', board.portPath);
                }}
              >Save Pin-Config
              </button>
            </div>
          </div>
        </div>
      ))()}
    </div>
  );
};

export default BoardMonitor;
