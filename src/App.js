import React, { useState, useCallback, useMemo } from 'react';
import styled from 'styled-components';
import './App.css';
import { useShrinkExtend } from './useShrinkExpand';

const Container = styled.div`
  height: 50px;
  width: 100%;
  background: #E8EAF6;
  position: relative;
  margin: 200px 0 3px;
`;

const TimeBlock = styled.div.attrs(({to, from, isDragging}) => ({
  style: {
    width: (to - from) * 50 + 'px',
    left: from * 50 + 'px',
    willChange: isDragging ? 'width, left' : 'auto',
  },
}))`
  background: #5C6BC0;
  height: 100%;
  border: 3px solid #2736c3;
  position: absolute;
  border-radius: 5px;
  top: 0;
  bottom: 0;
  transition: all ease 0.1s;
`;

const Handle = styled.div`
  position: absolute;
  top: 0;
  bottom: 0;
  height: 100%;
  width: 10px;
  ${(props) => props.left ? 'left: 0' : ''}
  ${(props) => props.right ? 'right: 0' : ''}
  background: #feac2d;
  cursor: ew-resize;
`;

const TimeLabel = styled.div`
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  color: white;
  font-size: 25px;
`;

function App() {
  const [from, setFrom] = useState(1);
  const [to, setTo] = useState(15);

  const [curFrom, fromDragEvents, isFromDragging] = useShrinkExtend(from, setFrom, 50);
  const validateTo = useCallback((newValue) => {
    const period = newValue - curFrom;
    return period > 0 && period < 24;
  }, []);
  const [curTo, toDragEvents, isToDragging] = useShrinkExtend(to, setTo, 50, validateTo);

  // If we simultaneously run events for left and right handles, we get movement event
  const combinedEvents = useMemo(() => ({
    onDrag: (e) => { fromDragEvents.onDrag(e); toDragEvents.onDrag(e); },
    onDragStart: (e) => { fromDragEvents.onDragStart(e); toDragEvents.onDragStart(e); },
    onDragEnd: (e) => { fromDragEvents.onDragEnd(e); toDragEvents.onDragEnd(e); }
  }), [fromDragEvents, toDragEvents]);

  return (
    <div className="App">
      <Container>
        <TimeBlock from={curFrom} to={curTo} isDragging={isFromDragging || isToDragging}>
          <Handle draggable left {...fromDragEvents} />
          <TimeLabel draggable {...combinedEvents}>{Math.round(curFrom)} - {Math.round(curTo)}</TimeLabel>
          <Handle draggable right {...toDragEvents} />
        </TimeBlock>
      </Container>
    </div>
  );
}

export default App;
