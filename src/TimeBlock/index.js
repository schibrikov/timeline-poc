import React, { useMemo, useCallback } from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import { useShrinkExtend } from '../useShrinkExpand';

const hourWidth = 40;

const Handle = styled.div`
  position: absolute;
  top: 0;
  bottom: 0;
  height: 100%;
  width: 3px;
  ${(props) => props.left ? 'left: 0' : ''}
  ${(props) => props.right ? 'right: 0' : ''}
  background: #4b9a3b;
  cursor: ew-resize;
`;

const Period = styled.div.attrs(({to, from, isDragging}) => ({
  style: {
    width: (to - from) * hourWidth + 'px',
    left: from * hourWidth + 'px',
    willChange: isDragging ? 'width, left' : 'auto',
  },
}))`
  background: #81c972;
  height: 100%;
  border: 1px solid #4b9a3b;
  position: absolute;
  top: 0;
  bottom: 0;
  margin: 1px 0;
  transition: all ease 0.1s;
`;

const TimeLabel = styled.div`
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  color: white;
  font-size: 14px;
`;

export function TimeBlock({ from, to, setFrom, setTo }) {
  const [curFrom, fromDragEvents, isFromDragging] = useShrinkExtend(from, setFrom, hourWidth);
  const validateTo = useCallback((newValue) => {
    const period = newValue - curFrom;
    return period > 0 && period < 24;
  }, []);
  const [curTo, toDragEvents, isToDragging] = useShrinkExtend(to, setTo, hourWidth, validateTo);

  // If we simultaneously run events for left and right handles, we get movement event
  const combinedEvents = useMemo(() => ({
    onDrag: (e) => { fromDragEvents.onDrag(e); toDragEvents.onDrag(e); },
    onDragStart: (e) => { fromDragEvents.onDragStart(e); toDragEvents.onDragStart(e); },
    onDragEnd: (e) => { fromDragEvents.onDragEnd(e); toDragEvents.onDragEnd(e); }
  }), [fromDragEvents, toDragEvents]);

  return (
    <Period from={curFrom} to={curTo} isDragging={isFromDragging || isToDragging}>
      <Handle draggable left {...fromDragEvents} />
      <TimeLabel draggable {...combinedEvents}>{Math.round(curFrom)} - {Math.round(curTo)}</TimeLabel>
      <Handle draggable right {...toDragEvents} />
    </Period>
  );
}

TimeBlock.propTypes = {
  from: PropTypes.number,
  to: PropTypes.number,
  setFrom: PropTypes.func,
  setTo: PropTypes.func,
};
