/**
 * Created by ky on 2016/12/19.
 */

import React from 'react';
import {ipcRenderer} from 'electron';

const PortSelector = ({portList, currentPortPath}) => {
  let options = [];
  options.push(<option value={null} key={'N/A'}>N/A</option>);
  portList.forEach((portProp) => (
    options.push(<option value={portProp.path} key={portProp.path}>{portProp.path}</option>)
  ));
  return (
    <select
      value={currentPortPath}
      onChange={(event) => {
        if (currentPortPath) {
          ipcRenderer.send('disconnectPort', currentPortPath);
        }
        if (event.target.value) {
          ipcRenderer.send('connectPort', event.target.value);
        }
      }}
    >
      {options}
    </select>
  )
};

export default PortSelector;