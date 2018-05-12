// @flow
import React, { Component } from 'react';
import PortListContainer from './PortListContainer';
import BoardMonitorContainer from './BoardMonitorContainer';

type Props = {};

export default class BoardPage extends Component<Props> {
  props: Props;

  render() {
    return (
      <div>
        <PortListContainer />
        <BoardMonitorContainer />
      </div>
    );
  }
}
