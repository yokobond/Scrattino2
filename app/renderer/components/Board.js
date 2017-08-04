/**
 * Created by ky on 2016/12/10.
 */

import React from 'react';
import PinMode from './BoardPinMode';
import PinValue from './BoardPinValue';
import BoardSelector from './BoardSelector';

const Board = ({board, ports, portPath}) => {
  return (
    <div>
      <div className="row">
        <div className="col-xs-12">
          <BoardSelector portList={ports} selectedPortPath={portPath}/>
        </div>
      </div>
      {(() => {
        if (board) {
          return (
            <div>
              <div className="row">
                <div className="col-xs-5 text-right form-horizontal">
                  {pins}
                  <button type="button" className="btn btn-default" onClick={() => {
                    ipcRenderer.send('saveBoard', board.portPath);
                  }}>Save
                  </button>
                </div>
              </div>
              <div className="row">
                <div className="col-xs-5 text-right form-horizontal">
                  {
                    (() => {
                      let pins = [];
                      for (let i = 0; i < board.pins.length; i++) {
                        pins.push(
                          <div className="form-group" key={i}>
                            <label className="col-xs-6" htmlFor={'pin' + i}>
                              <div className="col-xs-6 text-right">
                                <PinValue board={board} pinIndex={i}/>
                              </div>
                              <div className="col-xs-6 text-right" htmlFor={'pin' + i}>
                                {i}
                              </div>
                            </label>
                            <div className="col-xs-6" id={'pin' + i}>
                              <PinMode board={board} pinIndex={i}/>
                            </div>
                          </div>
                        )
                      }
                      return pins;
                    })()
                  }
                  <button type="button" className="btn btn-default" onClick={() => {
                    ipcRenderer.send('saveBoard', board.portPath);
                  }}>Save
                  </button>
                </div>
              </div>
            </div>
          )
        } else {
          return null;
        }
      })()}
    </div>
  )
};

export default Board;