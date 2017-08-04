import { combineReducers } from 'redux';
// import { routerReducer as routing } from 'react-router-redux';
import portList from './PortListReducer';
import board from './BoardReducer';

const rootReducer = combineReducers({
  portList,
  board,
  // routing
});

export default rootReducer;
