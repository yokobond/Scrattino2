/**
 * Created by ky on 2016/12/10.
 */

import React from 'react';
import {ipcRenderer} from 'electron';
import PinMode from './BoardPinMode';
import PinValue from './BoardPinValue';

const BoardMonitor = ({board, selectedPort}) => {
  if (!selectedPort || !board || !board.isOpen) return <div className="alert alert-warning">Not Connected</div>;
  let digitalPins = [];
  let analogChannels = [];
  for (let i = 0; i < board.pins.length; i++) {
    if (board.pins[i].analogChannel === 127) {
      digitalPins.push(i);
    } else {
      analogChannels.push(i);
    }
  }
  return (
    <div className="board-monitor">
      {(() => {
        return (
          <div>
            <div className="row">
              <div className="col-xs-12">
                {
                  (() => {
                    let pinsElem = [];
                    analogChannels.forEach((pinID) => {
                      pinsElem.push(
                        <div className="pin analog" key={pinID}>
                          <div className="pin-value col-sm-6">
                            <PinValue board={board} pinIndex={pinID}/>
                          </div>
                          <label className="pin-label col-sm-2" htmlFor={'pin' + pinID}>
                            A{board.pins[pinID].analogChannel}
                          </label>
                          <div className="pin-mode col-sm-4" id={'pin' + pinID}>
                            <PinMode board={board} pinIndex={pinID}/>
                          </div>
                        </div>
                      )
                    });
                    return <div className="col-xs-12">{pinsElem}</div>;
                  })()
                }
              </div>
              <div className="col-xs-12">
                {
                  (() => {
                    let pinsElem = [];
                    let colElem;
                    digitalPins.forEach((pinID, index) => {
                      if (index % 8 === 0) {
                        colElem = [];
                        pinsElem.push(<div className="col-xs-6">{colElem}</div>);
                      }
                      colElem.push(
                        <div className="pin" key={pinID}>
                          <div className="pin-value col-sm-6">
                            <PinValue board={board} pinIndex={pinID}/>
                          </div>
                          <label className="pin-label col-sm-2" htmlFor={'pin' + pinID}>
                            D{pinID}
                          </label>
                          <div className="pin-mode col-sm-4" id={'pin' + pinID}>
                            <PinMode board={board} pinIndex={pinID}/>
                          </div>
                        </div>
                      );
                    });
                    return pinsElem;
                  })()
                }
              </div>
            </div>
            <div className="row">
              <div className="col-xs-8"></div>
              <div className="col-xs-4">
                <button type="button" className="btn btn-default" disabled={!board.isOpen} onClick={() => {
                  ipcRenderer.send('saveBoardConfig', board.portPath);
                }}>Save Pin-Config
                </button>
              </div>
            </div>
          </div>
        )
      })()}
    </div>
  )
};

export default BoardMonitor;