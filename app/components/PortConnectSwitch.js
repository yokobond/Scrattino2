/**
 * Created by ky on 2016/12/14.
 */

import React, { PropTypes } from 'react';
import { ipcRenderer } from 'electron';

const PortConnectSwitch = ({ portPath, isConnected }) => (
  <label className="switch">
    <input
      type="checkbox"
      checked={isConnected || false}
      onChange={(event) => {
               if (event.target.checked) {
                 ipcRenderer.send('connectPort', portPath);
               } else {
                 ipcRenderer.send('disconnectPort', portPath);
               }
             }}
    />
    <div className="slider round" />
  </label>
);

export default PortConnectSwitch;
