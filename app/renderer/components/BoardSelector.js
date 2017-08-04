/**
 * Created by ky on 2016/12/19.
 */

import React from 'react';
import {ipcRenderer} from 'electron';

const BoardSelector = ({portList, portPath, changeBoard}) => {
  let options = [];
  options.push(<option value={null} key={'N/A'}>N/A</option>);
  portList.forEach((portProp) => (
    options.push(<option value={portProp.path} key={portProp.path}>{portProp.path}</option>)
  ));
  return (
    <select
      value={portPath}
      onChange={(event) => {
        changeBoard(event.target.value);
      }}
    >
      {options}
    </select>
  )
};

export default BoardSelector;