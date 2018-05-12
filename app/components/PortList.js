/**
 * Created by ky on 2016/11/25.
 */

import React from 'react';
// import styles from './PortList.css';
// const styles = {portList: 'portList', portPane: 'portPane', portName: 'portName'}; // dummy
import { ipcRenderer } from 'electron';
import ConnectSwitch from './PortConnectSwitch';

// function showBoardWindow(portPath) {
//   ipcRenderer.send('showBoardWindow', portPath);
// }

const PortListComponent = ({ ports, selectedPort, portListSelect }) => (
  <div className="sticky-top port-selector bg-light">
    <div className="row no-gutters">
      <button
        type="button"
        className="port-scan btn btn-default col-8 mx-auto"
        onClick={() => {
          ipcRenderer.send('detectPorts');
        }}
      >Scan Port
      </button>
    </div>
    <div className="row no-gutters">
      {ports.map(port => (
        <div
          key={port.path}
          className={`col-12 row no-gutters border border-right-0 border-left-0 ${(port.path === selectedPort) ? 'bg-primary text-white' : 'bg-light text-dark'}`}
          onClick={() => {
              portListSelect(port.path);
            }}
        >
          <div className="col-6 portlist-path">{port.path}</div>
          <div className="col-4 portlist-protocol">{port.portProtocol}</div>
          <div className="col-2 portlist-connection">
            {(() => {
                if (port.isFirmata) {
                  return (
                    <div>
                      <ConnectSwitch portPath={port.path} isConnected={port.isOpen} />
                    </div>);
                }
              })()}
          </div>
        </div>))
        }
    </div>
  </div>
);

export default PortListComponent;
