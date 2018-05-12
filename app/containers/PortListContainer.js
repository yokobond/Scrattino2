/**
 * Created by ky on 2016/11/25.
 */

import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import ConnectedComponent from '../components/PortList';
import * as ConnectedActions from '../actions/PortListActions';

function mapStateToProps(state) {
  return {
    ports: state.portList.ports,
    selectedPort: state.portList.selectedPort,
  };
}

function mapDispatchToProps(dispatch) {
  return bindActionCreators(ConnectedActions, dispatch);
}

export default connect(mapStateToProps, mapDispatchToProps)(ConnectedComponent);
