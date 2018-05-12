/**
 * Created by ky on 2016/12/10.
 */

export const BOARD_CHANGED = 'BOARD_CHANGED';
export const CHANGE_BOARD = 'CHANGE_BOARD';

export function boardChanged(newBoard) {
  return {
    type: BOARD_CHANGED,
    board: newBoard,
  };
}

export function changeBoard(portPath) {
  return {
    type: CHANGE_BOARD,
    portPath: portPath,
  };
}
