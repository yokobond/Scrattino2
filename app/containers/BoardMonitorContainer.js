/**
 * Created by ky on 2016/11/25.
 */

import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import ConnectedComponent from '../components/BoardMonitor';
import * as BoardActions from '../actions/BoardActions';

const ConnectedActions = [
  BoardActions.BOARD_CHANGED,
  BoardActions.CHANGE_BOARD
];

function mapStateToProps(state) {
  return {
    board: state.board.board,
    selectedPort: state.portList.selectedPort
  };
}

function mapDispatchToProps(dispatch) {
  return bindActionCreators(ConnectedActions, dispatch);
}

export default connect(mapStateToProps, mapDispatchToProps)(ConnectedComponent);
