/**
 * Created by ky on 2016/12/09.
 */

import React from 'react';
import {ipcRenderer} from 'electron';

function modeName(mode, modeNames) {
  if (mode == null) return 'N/A';
  let name = Object.keys(modeNames).find((key) => (modeNames[key] === mode));
  return (name ? name : mode.toString());
}

const BoardPinMode = ({board, pinIndex}) => {
  let pinData = board.pins[pinIndex];
  let options = [];
  options.push(<option value={-1} key={-1} disabled>N/A</option>);
  pinData.supportedModes.forEach((mode) => (
    options.push(<option value={mode} key={mode}>{modeName(mode, board.MODES)}</option>)
  ));
  return (
    <select disabled={!board.isOpen}
            value={((pinData.mode == null) ? -1 : pinData.mode)}
            onChange={(event) => {
              ipcRenderer.send('setPinMode', board.portPath, pinIndex, event.target.value);
            }}
    >
      {options}
    </select>
  )
};

export default BoardPinMode;