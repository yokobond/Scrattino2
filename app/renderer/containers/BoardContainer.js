/**
 * Created by ky on 2016/11/25.
 */

import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import ConnectedComponent from '../components/Board';
import * as BoardActions from '../actions/BoardActions';
import * as PortListActions from '../actions/PortListActions';

const ConnectedActions = [
  ...BoardActions,
  ...PortListActions
];

function mapStateToProps(state) {
  return {
    board: state.board.board,
    portPath: state.board.portPath,
    ports: state.portList.ports,
  };
}

function mapDispatchToProps(dispatch) {
  return bindActionCreators(ConnectedActions, dispatch);
}

export default connect(mapStateToProps, mapDispatchToProps)(ConnectedComponent);
