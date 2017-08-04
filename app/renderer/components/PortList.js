/**
 * Created by ky on 2016/11/25.
 */

import React from 'react';
// import styles from './PortList.css';
// const styles = {portList: 'portList', portPane: 'portPane', portName: 'portName'}; // dummy
import {ipcRenderer} from 'electron';
import ConnectSwitch from './PortConnectSwitch';

function showBoardWindow(portPath) {
  ipcRenderer.send('showBoardWindow', portPath);
}

const PortListComponent = ({ports, selectedPort, portListSelect}) => {
  return (
    <div>
      <div className="row">
        <button type="button" className="port-scan btn btn-default col-xs-10 col-xs-offset-1" onClick={() => {
          ipcRenderer.send('detectPorts')
        }}>Scan Port
        </button>
      </div>
      <div className="row">
        {ports.map(port =>
          <div
            key={port.path}
            className={"col-xs-12" + ((port.path === selectedPort) ? " bg-primary" : "")}
            onClick={() => {
              portListSelect(port.path);
            }}
          >
            <div className="col-xs-6 col-sm-6 col-md-6 portlist-path">{port.path}</div>
            <div className="col-sm-4 col-md-4 portlist-protocol">{port.portProtocol}</div>
            <div className="col-sm-2 col-md-2 portlist-connection">
              {(() => {
                if (port.isFirmata) {
                  return (<div>
                    <ConnectSwitch portPath={port.path} isConnected={port.isOpen}/>
                    {/*<button type="button" onClick={() => {*/}
                      {/*showBoardWindow(port.path);*/}
                    {/*}}>Open*/}
                    {/*</button>*/}
                  </div>)
                }
              })()}
            </div>
          </div>)
        }
      </div>
    </div>
  );
};

export default PortListComponent;
