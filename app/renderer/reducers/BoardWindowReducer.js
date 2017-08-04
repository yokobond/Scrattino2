/**
 * Created by ky on 2016/12/10.
 */

import { combineReducers } from 'redux';
// import { routerReducer as routing } from 'react-router-redux';
import board from './BoardReducer'
import portList from './PortListReducer'

const rootReducer = combineReducers({
  board,
  portList,
  // routing
});

export default rootReducer;
