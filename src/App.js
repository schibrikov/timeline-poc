import React, { useState, useCallback, useRef, useEffect } from 'react';
import styled from 'styled-components';
import './App.css';

const Container = styled.div`
  height: 50px;
  width: 100%;
  background: #E8EAF6;
  position: relative;
  margin: 200px 0 3px;
`;

const TimeBlock = styled.div`
  background: #5C6BC0;
  height: 100%;
  width: ${(props) => `${(props.to - props.from) * 50}px`};
  border: 3px solid #2736c3;
  position: absolute;
  border-radius: 5px;
  left: ${(props) => `${props.from * 50}px`};
  top: 0;
  bottom: 0;
  transition: all ease 0.3s;
  ${(props) => props.isDragging ? 'will-change: width, left' : ''}
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

  const [currentFrom, setCurrentFrom] = useState(from);
  const [currentTo, setCurrentTo] = useState(to);

  const [isDragging, setDragging] = useState(false);

  useEffect(() => {
    console.log('from: ', from, ' to: ', to);
  }, [to]);

  const blockRef = useRef(null);
  const [xStart, setXStart] = useState(null);

  const timePeriod = to - from;

  const handleRightDragStart = useCallback((e) => {
    setDragging(true);
    setXStart(e.clientX);
  }, [from, to]);

  const handleRightDragContinue = useCallback((e) => {
    const xDiff = e.clientX - xStart;
    // const pixelStep = blockRef.current && (blockRef.current.clientWidth / timePeriod);
    const pixelStep = 50;
    const increase = Math.floor(xDiff / pixelStep);

    if (to + increase - from > 24) {
      console.error("can't be longer than 24 hours")
    } else if (to + increase - from < 1) {
      console.error("can't be less than 1 hour")
    } else {
      if (increase > 0) {
        setCurrentTo(to + increase);
      }
      // setCurrentTo(currentTo + increase);
      // setXStart(e.clientX);
    }
  }, [currentTo]);

  const handleRightDragEnd = useCallback(() => {
    // commit phase
    setDragging(false);
    setTo(currentTo);
  }, [currentTo]);

  return (
    <div className="App">
      <Container>
        <TimeBlock from={isDragging ? currentFrom : from} to={isDragging ? currentTo : to} ref={blockRef} isDragging={isDragging}>
          <Handle draggable left />
          <TimeLabel>{isDragging ? currentFrom : from} - {isDragging ? currentTo : to}</TimeLabel>
          <Handle draggable right onDragStart={handleRightDragStart} onDrag={handleRightDragContinue} onDragEnd={handleRightDragEnd} />
        </TimeBlock>
      </Container>
    </div>
  );
}

export default App;
