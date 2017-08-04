/**
 * Created by ky on 2016/12/10.
 */

import {BOARD_CHANGED, CHANGE_BOARD} from '../actions/BoardActions';

const initialState = {
  portPath: null,
  board: null,
  isConnected: false,
};

export default function board(state = initialState, action) {
  switch (action.type) {
    case BOARD_CHANGED:
      let board = action.board;
      // console.log(state);
      return (
        {
          ...state,
          board: board,
        }
      );
    case CHANGE_BOARD:
      let portPath = action.portPath;
      // console.log(portPath);
      return (
        {
          ...state,
          portPath: portPath,
        }
      );
    default:
      return state;
  }
}
