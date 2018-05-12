// @flow
import { combineReducers } from 'redux';
import { routerReducer as router } from 'react-router-redux';
import portList from './PortListReducer';
import board from './BoardReducer';

const rootReducer = combineReducers({
  portList,
  board,
  router,
});

export default rootReducer;
