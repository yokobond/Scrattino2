/**
 * Created by ky on 2016/12/16.
 */

import React, { PropTypes } from 'react';

const BoardPinValue = ({ board, pinIndex }) => {
  const pin = board.pins[pinIndex];
  return (
    <span>{pin.value}</span>
  );
};

export default BoardPinValue;
