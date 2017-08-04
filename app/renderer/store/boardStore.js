/**
 * Created by ky on 2016/12/10.
 */

import {createStore, compose, applyMiddleware} from 'redux';
import reducer from '../reducers/BoardWindowReducer';
import createLogger from 'redux-logger';
// import createSagaMiddleware from 'redux-saga';
// import saga from './sagas';

import * as BoardActions from '../actions/BoardActions';
import * as PortListActions from '../actions/PortListActions';

const actionCreators = {
  ...BoardActions,
  ...PortListActions,
  // push,  // for react-router
};

const logger = createLogger({
  level: 'info',
  collapsed: true
});

// If Redux DevTools Extension is installed use it, otherwise use Redux compose
/* eslint-disable no-underscore-dangle */
const composeEnhancers = window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ ?
  window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__({
    // Options: http://zalmoxisus.github.io/redux-devtools-extension/API/Arguments.html
    actionCreators,
  }) :
  compose;
/* eslint-enable no-underscore-dangle */
const enhancer = composeEnhancers(
  applyMiddleware(logger)
  // applyMiddleware(
  //   createSagaMiddleware(saga),
  //   logger()
  // )
);

export default function configureStore(initialState) {
  return createStore(reducer, initialState, enhancer);
}