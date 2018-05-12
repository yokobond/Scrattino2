/**
 * Created by ky on 2016/12/10.
 */

import { BOARD_CHANGED, CHANGE_BOARD } from '../actions/BoardActions';

const initialState = {
  portPath: null,
  board: null,
  isConnected: false,
};

export default function board(state = initialState, action) {
  switch (action.type) {
    case BOARD_CHANGED: {
      const board = action.board;
      // console.log(state);
      return (
        {
          ...state,
          board,
        }
      );
    }
    case CHANGE_BOARD: {
      const portPath = action.portPath;
      // console.log(portPath);
      return (
        {
          ...state,
          portPath,
        }
      );
    }
    default:
      return state;
  }
}
